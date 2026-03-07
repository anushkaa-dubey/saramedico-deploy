const content = `SUBJECTIVE

{
  "medications": "PRN aspirin for headaches",
  "family_history": "Father had MI at age 58",
  "social_history": "Former smoker (quit 5 years ago), social drinker (occasional wine on weekends)",
  "chief_complaint": "Chest pain for three days",
  "history_of_present_illness": "52-year-old male presents with intermittent central chest tightness radiating to left shoulder. Pain is exertional, worsening with stairs and physical activity. Associated symptoms include shortness of breath. Denies nausea. No prior similar episodes, though patient reports history of heartburn."
}`;

let cleanedString = content.replace(/```json/gi, '').replace(/```/g, '').trim();
if (cleanedString.indexOf('{') !== -1 && cleanedString.lastIndexOf('}') !== -1) {
    cleanedString = cleanedString.substring(cleanedString.indexOf('{'), cleanedString.lastIndexOf('}') + 1);
}

try {
    console.log(JSON.parse(cleanedString));
} catch (e) {
    console.log("Failed", e);
}
