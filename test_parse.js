const content = `{\n  "medications": "PRN aspirin for headaches",\n  "family_history": "Father had MI at age 58",\n  "social_history": "Former smoker (quit 5 years ago), social drinker (occasional wine)",\n  "chief_complaint": "Chest pain for 3 days",\n  "history_of_present_illness": "52-year-old male presents with intermittent central chest tightness radiating to left shoulder. Pain exacerbated by physical activity and stair climbing. Associated with shortness of breath. No nausea. No prior similar episodes, though patient reports previous heartburn."\n}`;

try {
    const parsed = JSON.parse(content);
    console.log("Parsed success!", typeof parsed);
} catch (e) {
    console.log("Parse failed", e);
}
