try {
  const { parseResume } = require("./utils/resumeParser");
  console.log("Success: resumeParser required");
} catch (err) {
  console.error("FAILED TO REQUIRE:", err);
}
