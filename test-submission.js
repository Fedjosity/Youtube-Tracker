// Simple test script to verify submission API
const testSubmission = async () => {
  console.log("Testing submission API...");

  // Test data for YouTube submission
  const youtubeSubmission = {
    title: "Test YouTube Video",
    description: "This is a test YouTube submission",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    link_type: "youtube",
  };

  // Test data for Drive submission
  const driveSubmission = {
    title: "Test Drive Document",
    description: "This is a test Drive submission",
    drive_url: "https://drive.google.com/file/d/1234567890/view",
    link_type: "drive",
  };

  try {
    console.log("\n1. Testing YouTube submission...");
    const youtubeResponse = await fetch(
      "http://localhost:3000/api/submissions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(youtubeSubmission),
      }
    );

    const youtubeResult = await youtubeResponse.json();
    console.log("YouTube Response Status:", youtubeResponse.status);
    console.log("YouTube Response:", youtubeResult);

    console.log("\n2. Testing Drive submission...");
    const driveResponse = await fetch("http://localhost:3000/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(driveSubmission),
    });

    const driveResult = await driveResponse.json();
    console.log("Drive Response Status:", driveResponse.status);
    console.log("Drive Response:", driveResult);
  } catch (error) {
    console.error("Test failed:", error);
  }
};

// Run the test
testSubmission();
