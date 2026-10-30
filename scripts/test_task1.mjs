/**
 * Unit Tests for Task 1: Engine Config & pick() Language Resolver
 */

import { pick, pickQuestion, pickOption, pickExplanation, ENGINE_CONFIG } from "../src/lib/config/engine.config.js";
import { getLocalizedQuestion, getLocalizedOption } from "../src/lib/questionTranslations.js";

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName, details = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ""}`);
  }
}

console.log("\n=======================================================");
console.log("RUNNING SUITE: TASK 1 - pick() LANGUAGE RESOLVER");
console.log("=======================================================");

// 1. Normal field pick
{
  const field = { en: "Electric flux", ta: "மின்பாயம்" };
  assert(pick(field, "en") === "Electric flux", "pick(field, 'en') returns English string");
  assert(pick(field, "ta") === "மின்பாயம்", "pick(field, 'ta') returns Tamil string");
  assert(pick(field, "Tamil") === "மின்பாயம்", "pick(field, 'Tamil') aliases to 'ta' seamlessly");
  assert(pick(field, "English") === "Electric flux", "pick(field, 'English') aliases to 'en' seamlessly");
}

// 2. Missing / empty / null field fallback
{
  const missingTa = { en: "Only English" };
  assert(pick(missingTa, "ta") === ENGINE_CONFIG.missingMessage.ta, "Missing Tamil field returns config fallback message");
  const missingEn = { ta: "தமிழ் மட்டும்" };
  assert(pick(missingEn, "en") === ENGINE_CONFIG.missingMessage.en, "Missing English field returns config fallback message");
  assert(pick(null, "ta") === ENGINE_CONFIG.missingMessage.ta, "Null field returns config fallback message");
  assert(pick({ ta: "   " }, "ta") === ENGINE_CONFIG.missingMessage.ta, "Whitespace-only field returns config fallback message");
}

// 3. pickQuestion() wrapper
{
  const bilingualQ = {
    question_en: "Bauxite is an ore of which metal?",
    question_ta: "பாக்சைட் என்பது எந்த உலோகத்தின் தாது?"
  };
  assert(pickQuestion(bilingualQ, "ta") === "பாக்சைட் என்பது எந்த உலோகத்தின் தாது?", "pickQuestion returns Tamil question text");
  assert(pickQuestion(bilingualQ, "en") === "Bauxite is an ore of which metal?", "pickQuestion returns English question text");

  const nullQ = null;
  assert(pickQuestion(nullQ, "ta") === ENGINE_CONFIG.missingMessage.ta, "pickQuestion with null returns fallback message");
}

// 4. pickOption() wrapper
{
  const opt = {
    id: "B",
    textEn: "Aluminium",
    textTa: "அலுமினியம்"
  };
  assert(pickOption(opt, "ta") === "அலுமினியம்", "pickOption returns Tamil option text");
  assert(pickOption(opt, "en") === "Aluminium", "pickOption returns English option text");
}

// 5. pickExplanation() wrapper
{
  const exp = {
    explanation_en: "Bauxite (Al2O3·2H2O) is the primary aluminium ore.",
    explanation_ta: "பாக்சைட் (Al2O3·2H2O) என்பது அலுமினியத்தின் முக்கிய தாதுவாகும்."
  };
  assert(pickExplanation(exp, "ta") === "பாக்சைட் (Al2O3·2H2O) என்பது அலுமினியத்தின் முக்கிய தாதுவாகும்.", "pickExplanation returns Tamil explanation");
  assert(pickExplanation(exp, "en") === "Bauxite (Al2O3·2H2O) is the primary aluminium ore.", "pickExplanation returns English explanation");
}

// 6. getLocalizedQuestion and getLocalizedOption backward-compatibility integration
{
  const q = {
    questionText: "The electric flux through a closed surface depends upon:",
    questionTextTa: "ஒரு மூடிய பரப்பின் வழியே பாயும் மின்பாயம் எதனைச் சார்ந்தது?"
  };
  assert(getLocalizedQuestion(q, true) === "ஒரு மூடிய பரப்பின் வழியே பாயும் மின்பாயம் எதனைச் சார்ந்தது?", "getLocalizedQuestion delegates cleanly to pick()");
}

console.log("\n=======================================================");
console.log(`ALL TESTS FINISHED: ${passedTests} / ${totalTests} PASSED`);
console.log("=======================================================\n");

if (passedTests !== totalTests) {
  process.exit(1);
}

