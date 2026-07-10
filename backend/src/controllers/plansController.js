const Plan = require("../models/Plan");
const Company = require("../models/Company");

// Helper: Seed default plans if none exist in the database
const seedDefaultPlansIfEmpty = async () => {
  const count = await Plan.countDocuments();
  if (count > 0) return;

  const defaultPlans = [
    {
      plan_name: "Free Trial",
      plan_type: "free",
      price: 0,
      billing_cycle: "one_time",
      limits: {
        job_posts: 2,
        team_members: 1,
        applications: 10
      },
      features: {
        analytics: false,
        featured_jobs: false,
        priority_support: false,
        custom_branding: false,
        api_access: false,
        dedicated_manager: false
      },
      support_type: "basic",
      is_active: true,
      is_popular: false
    },
    {
      plan_name: "Basic",
      plan_type: "basic",
      price: 999,
      billing_cycle: "monthly",
      limits: {
        job_posts: 5,
        team_members: 3,
        applications: -1 // unlimited
      },
      features: {
        analytics: false,
        featured_jobs: false,
        priority_support: false,
        custom_branding: false,
        api_access: false,
        dedicated_manager: false
      },
      support_type: "email",
      is_active: true,
      is_popular: false
    },
    {
      plan_name: "Pro",
      plan_type: "pro",
      price: 2999,
      billing_cycle: "monthly",
      limits: {
        job_posts: 25,
        team_members: 10,
        applications: -1
      },
      features: {
        analytics: true,
        featured_jobs: true,
        priority_support: true,
        custom_branding: false,
        api_access: false,
        dedicated_manager: false
      },
      support_type: "priority",
      is_active: true,
      is_popular: true
    },
    {
      plan_name: "Enterprise",
      plan_type: "enterprise",
      price: 0, // Custom pricing representation
      billing_cycle: "monthly",
      limits: {
        job_posts: -1,
        team_members: -1,
        applications: -1
      },
      features: {
        analytics: true,
        featured_jobs: true,
        priority_support: true,
        custom_branding: true,
        api_access: true,
        dedicated_manager: true
      },
      support_type: "dedicated",
      is_active: true,
      is_popular: false
    }
  ];

  await Plan.create(defaultPlans);
};

// 1. GET /api/super-admin/plans
// Returns all plans with dynamic calculations
exports.getPlans = async (req, res) => {
  try {
    await seedDefaultPlansIfEmpty();

    const plans = await Plan.find().sort({ price: 1 }).lean();

    // Dynamically calculate subscription telemetry from Company document state
    const companyStats = await Company.aggregate([
      { $match: { plan_status: "active", plan_id: { $ne: null } } },
      {
        $group: {
          _id: "$plan_id",
          count: { $sum: 1 }
        }
      }
    ]);

    const statsMap = {};
    companyStats.forEach(stat => {
      statsMap[stat._id.toString()] = stat.count;
    });

    let totalPlatformRevenue = 0;

    const formattedPlans = plans.map(plan => {
      const activeCount = statsMap[plan._id.toString()] || 0;
      const planRevenue = activeCount * (plan.price || 0);
      totalPlatformRevenue += planRevenue;

      return {
        ...plan,
        subscribed_companies: activeCount,
        monthly_revenue: planRevenue
      };
    });

    res.json({
      success: true,
      plans: formattedPlans,
      totalPlatformRevenue
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. POST /api/super-admin/plans
// Create new plan
exports.createPlan = async (req, res) => {
  try {
    const { plan_name, plan_type, price, billing_cycle, limits, features, support_type, is_active, is_popular } = req.body;

    if (!plan_name || !plan_type || !billing_cycle || !support_type) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    // Validate unique plan_type
    const existingType = await Plan.findOne({ plan_type });
    if (existingType) {
      return res.status(400).json({ success: false, message: `A plan with type '${plan_type}' already exists. Select a unique type.` });
    }

    // Capture user for createdBy
    const planData = {
      plan_name,
      plan_type,
      price: Number(price) || 0,
      billing_cycle,
      limits: limits || { job_posts: -1, team_members: -1, applications: -1 },
      features: features || { analytics: false, featured_jobs: false, priority_support: false },
      support_type,
      is_active: is_active !== undefined ? is_active : true,
      is_popular: is_popular !== undefined ? is_popular : false,
      created_by: req.user?._id
    };

    const newPlan = await Plan.create(planData);

    // Metadata for logAction middleware
    req.actionName = "plan_created";
    req.newData = newPlan.toObject();
    req.description = `Subscription Plan '${newPlan.plan_name}' created by Super Admin`;

    res.status(201).json({ success: true, message: "Plan created successfully", plan: newPlan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. PUT /api/super-admin/plans/:id
// Update plan
exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found." });
    }

    // Check if companies are currently subscribed
    const companiesSubscribed = await Company.countDocuments({ plan_id: id, plan_status: "active" });

    // Store old document for audit log
    req.oldData = plan.toObject();

    const { plan_name, plan_type, price, billing_cycle, limits, features, support_type, is_active, is_popular } = req.body;

    // Validate uniqueness of plan_type if modified
    if (plan_type && plan_type !== plan.plan_type) {
      const existingType = await Plan.findOne({ plan_type, _id: { $ne: id } });
      if (existingType) {
        return res.status(400).json({ success: false, message: `A plan with type '${plan_type}' already exists.` });
      }
    }

    if (plan_name) plan.plan_name = plan_name;
    if (plan_type) plan.plan_type = plan_type;
    if (price !== undefined) plan.price = Number(price);
    if (billing_cycle) plan.billing_cycle = billing_cycle;
    if (limits) plan.limits = { ...plan.limits, ...limits };
    if (features) plan.features = { ...plan.features, ...features };
    if (support_type) plan.support_type = support_type;
    if (is_active !== undefined) plan.is_active = is_active;
    if (is_popular !== undefined) plan.is_popular = is_popular;

    await plan.save();

    // Metadata for logAction middleware
    req.actionName = "plan_updated";
    req.newData = plan.toObject();
    req.description = `Subscription Plan '${plan.plan_name}' modified by Super Admin`;

    res.json({
      success: true,
      message: "Plan updated successfully",
      plan,
      warning: companiesSubscribed > 0 ? `Editing this plan affected ${companiesSubscribed} companies currently subscribed.` : null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. PATCH /api/super-admin/plans/:id/toggle
// Enable / Disable plan
exports.togglePlanActive = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found." });
    }

    const { is_active } = req.body;
    if (is_active === undefined) {
      return res.status(400).json({ success: false, message: "Field 'is_active' is required in request body." });
    }

    // Safety rule: Cannot disable Free plan
    if (plan.plan_type === "free" && is_active === false) {
      return res.status(400).json({ success: false, message: "Security rule violation: Free Trial plan cannot be disabled and must remain always available." });
    }

    // Capture states
    req.oldData = plan.toObject();
    plan.is_active = is_active;
    await plan.save();

    req.actionName = is_active ? "plan_enabled" : "plan_disabled";
    req.newData = plan.toObject();
    req.description = `Subscription Plan '${plan.plan_name}' ${is_active ? "enabled" : "disabled"} by Super Admin`;

    res.json({ success: true, message: `Plan '${plan.plan_name}' has been ${is_active ? "enabled" : "disabled"} successfully`, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. DELETE /api/super-admin/plans/:id
// Delete only if 0 companies subscribed
exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found." });
    }

    // Only delete if 0 companies are active
    const activeSubscriptions = await Company.countDocuments({ plan_id: id, plan_status: "active" });
    if (activeSubscriptions > 0) {
      return res.status(400).json({
        success: false,
        message: `Deletion denied. There are ${activeSubscriptions} companies currently on this plan. Please disable the plan instead to prevent new sign-ups.`
      });
    }

    req.oldData = plan.toObject();
    await Plan.findByIdAndDelete(id);

    req.actionName = "plan_deleted";
    req.newData = null;
    req.description = `Subscription Plan '${plan.plan_name}' hard-deleted by Super Admin`;

    res.json({ success: true, message: `Plan '${plan.plan_name}' deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 6. GET /api/super-admin/plans/stats
// Return live dashboard totals
exports.getStats = async (req, res) => {
  try {
    await seedDefaultPlansIfEmpty();

    const [totalPlans, activeCompaniesCount, companies] = await Promise.all([
      Plan.countDocuments(),
      Company.countDocuments({ plan_status: "active", plan_id: { $ne: null } }),
      Company.find({ plan_status: "active", plan_id: { $ne: null } }).select("plan_id").lean()
    ]);

    // Aggregate monthly revenue dynamically
    const plans = await Plan.find().lean();
    const plansMap = {};
    plans.forEach(p => {
      plansMap[p._id.toString()] = p;
    });

    let monthlyRevenueTotal = 0;
    const frequencyMap = {};

    companies.forEach(comp => {
      const planIdStr = comp.plan_id ? comp.plan_id.toString() : null;
      if (planIdStr && plansMap[planIdStr]) {
        const plan = plansMap[planIdStr];
        monthlyRevenueTotal += plan.price || 0;
        frequencyMap[planIdStr] = (frequencyMap[planIdStr] || 0) + 1;
      }
    });

    // Find most popular plan
    let mostPopularPlanName = "N/A";
    let maxCount = -1;
    let popularPlanSubscribers = 0;

    Object.keys(frequencyMap).forEach(planIdStr => {
      if (frequencyMap[planIdStr] > maxCount) {
        maxCount = frequencyMap[planIdStr];
        if (plansMap[planIdStr]) {
          mostPopularPlanName = plansMap[planIdStr].plan_name;
          popularPlanSubscribers = frequencyMap[planIdStr];
        }
      }
    });

    // Fallback if no subscriptions
    if (mostPopularPlanName === "N/A" && plans.length > 0) {
      // Return Pro or the first popular designated plan
      const popularPlan = plans.find(p => p.is_popular) || plans[0];
      mostPopularPlanName = popularPlan.plan_name;
      popularPlanSubscribers = 0;
    }

    res.json({
      success: true,
      stats: {
        totalPlans,
        activeCompanies: activeCompaniesCount,
        monthlyRevenue: monthlyRevenueTotal,
        mostPopularPlan: {
          name: mostPopularPlanName,
          subscribers: popularPlanSubscribers
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
