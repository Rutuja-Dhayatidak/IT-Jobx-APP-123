const Ticket = require("../models/Ticket");
const Candidate = require("../models/Candidate");

// Get all tickets with user info
exports.getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("user", "firstName lastName email")
      .sort("-updatedAt");
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reply to a ticket
exports.replyTicket = async (req, res) => {
  try {
    const { ticketId, message } = req.body;
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.replies.push({
      sender: "support",
      message,
      createdAt: new Date()
    });

    // Automatically move to in-progress if it was open
    if (ticket.status === "open") {
      ticket.status = "in-progress";
    }

    await ticket.save();
    res.json({ message: "Reply sent successfully", ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark ticket as resolved
exports.closeTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id, 
      { status: "resolved" },
      { new: true }
    );
    res.json({ message: "Ticket resolved successfully", ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users for support help panel
exports.getUsers = async (req, res) => {
  try {
    const users = await Candidate.find().select("firstName lastName email status createdAt");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get dashboard stats
exports.getStats = async (req, res) => {
  try {
    const total = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ status: "open" });
    const inProgress = await Ticket.countDocuments({ status: "in-progress" });
    const resolved = await Ticket.countDocuments({ status: "resolved" });

    res.json({ total, open, inProgress, resolved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
