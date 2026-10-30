import { createClient } from "@libsql/client/web";

const tursoUrl = process.env.TURSO_DATABASE_URL || "libsql://aknex-exam-db-aadhavank.aws-ap-south-1.turso.io";
const tursoToken = process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMzNjY0NTMsImlkIjoiMDFhMThjZjgtM2EwMS03NDAyLWE2MmQtYmI1MmRiZTZkNmExIiwia2lkIjoiaERvVmJ3b0dTYXZaaWFjTExVVU56c1VLaHBNU1hoMzVoSk8yZGlUN2FnRSIsInJpZCI6ImY2ZTNmYTUyLThmNTMtNDJlMi1iZjcwLTIxMTkxYzg5YjY0ZiJ9.hdc6PMQEIveXiH-DxiIqypTPP7lE2UYHNWS-eaZS-R3BJzplTFadwc4VXrX1yD-DS8mf_JeHf39-ZFIb53gsAw";

const client = createClient({ url: tursoUrl, authToken: tursoToken });

const PHYSICS_BILINGUAL = [
  {
    num: 1,
    qEn: "The electric flux through a closed surface depends upon:",
    qTa: "ஒரு மூடிய பரப்பின் வழியே பாயும் மின்பாயம் எதனைச் சார்ந்தது?",
    options: [
      { id: "A", text: "Shape of surface", textEn: "Shape of surface", textTa: "பரப்பின் வடிவம்" },
      { id: "B", text: "Net charge enclosed", textEn: "Net charge enclosed", textTa: "உள்ளடக்கிய மொத்த மின்னூட்டம்" },
      { id: "C", text: "Permittivity of outer medium only", textEn: "Permittivity of outer medium only", textTa: "வெளி ஊடகத்தின் விடுதிறன் மட்டுமே" },
      { id: "D", text: "Surface area", textEn: "Surface area", textTa: "பரப்பளவு" },
    ],
    expEn: "By Gauss's law, total electric flux Φ = q_net / ε₀, which depends solely on the net charge enclosed by the surface.",
    expTa: "காஸ் விதியின்படி, மொத்த மின்பாயம் Φ = q_net / ε₀ ஆகும். இது மூடிய பரப்பினால் சூழப்பட்ட மொத்த மின்னூட்டத்தை மட்டுமே சார்ந்தது.",
  },
  {
    num: 2,
    qEn: "Kirchhoff's first law (junction rule) expresses the conservation of:",
    qTa: "கிர்க்காஃபின் முதல் விதி (சந்தி விதி) எதன் மாறா விதியை விளக்குகிறது?",
    options: [
      { id: "A", text: "Energy", textEn: "Energy", textTa: "ஆற்றல்" },
      { id: "B", text: "Momentum", textEn: "Momentum", textTa: "உந்தம்" },
      { id: "C", text: "Electric charge", textEn: "Electric charge", textTa: "மின்னூட்டம்" },
      { id: "D", text: "Angular momentum", textEn: "Angular momentum", textTa: "கோண உந்தம்" },
    ],
    expEn: "Kirchhoff's current law states that total current entering a junction equals current leaving it, conserving electric charge.",
    expTa: "கிர்க்காஃபின் மின்னோட்ட விதியானது ஒரு சந்தியில் நுழையும் மின்னோட்டங்களின் கூட்டுத்தொகை வெளியேறும் மின்னோட்டங்களின் கூட்டுத்தொகைக்கு சமம் என்கிறது. இது மின்னூட்ட மாறா விதியாகும்.",
  },
  {
    num: 3,
    qEn: "A step-up transformer converts:",
    qTa: "ஒரு ஏற்று மின்மாற்றி மாற்றுவது:",
    options: [
      { id: "A", text: "Low voltage into high voltage", textEn: "Low voltage into high voltage", textTa: "குறைந்த மின்னழுத்தத்தை உயர் மின்னழுத்தமாக" },
      { id: "B", text: "High voltage into low voltage", textEn: "High voltage into low voltage", textTa: "உயர் மின்னழுத்தத்தை குறைந்த மின்னழுத்தமாக" },
      { id: "C", text: "AC into DC", textEn: "AC into DC", textTa: "மாறுதிசை மின்னோட்டத்தை நேர்திசை மின்னோட்டமாக" },
      { id: "D", text: "DC into AC", textEn: "DC into AC", textTa: "நேர்திசை மின்னோட்டத்தை மாறுதிசை மின்னோட்டமாக" },
    ],
    expEn: "A step-up transformer increases secondary voltage while decreasing secondary current, converting low voltage AC to high voltage AC.",
    expTa: "ஏற்று மின்மாற்றி குறைந்த மாறுதிசை மின்னழுத்தத்தை உயர் மாறுதிசை மின்னழுத்தமாக மாற்றுகிறது.",
  },
  {
    num: 4,
    qEn: "Which of the following electromagnetic waves has the highest frequency?",
    qTa: "பின்வரும் மின்காந்த அலைகளில் மிக அதிக அதிர்வெண் கொண்டது எது?",
    options: [
      { id: "A", text: "X-rays", textEn: "X-rays", textTa: "எக்ஸ்-கதிர்கள்" },
      { id: "B", text: "Gamma rays", textEn: "Gamma rays", textTa: "காமா கதிர்கள்" },
      { id: "C", text: "Ultraviolet rays", textEn: "Ultraviolet rays", textTa: "புறஊதாக் கதிர்கள்" },
      { id: "D", text: "Microwaves", textEn: "Microwaves", textTa: "நுண்ணலைகள்" },
    ],
    expEn: "Gamma rays have the shortest wavelength (< 10⁻¹² m) and highest frequency (> 10²⁰ Hz) in the electromagnetic spectrum.",
    expTa: "மின்காந்த நிறமாலையிலேயே மிகக் குறைந்த அலைநீளமும், மிக அதிக அதிர்வெண்ணும் (10²⁰ Hz-க்கு மேல்) கொண்டது காமா கதிர்கள் ஆகும்.",
  },
  {
    num: 5,
    qEn: "The phenomenon responsible for the twinkling of stars is:",
    qTa: "விண்மீன்கள் மின்னுவதற்கு காரணமான நிகழ்வு:",
    options: [
      { id: "A", text: "Refraction by atmosphere", textEn: "Refraction by atmosphere", textTa: "வளிமண்டல ஒளிவிலகல்" },
      { id: "B", text: "Total internal reflection", textEn: "Total internal reflection", textTa: "முழு அக எதிரொளிப்பு" },
      { id: "C", text: "Scattering of light", textEn: "Scattering of light", textTa: "ஒளிச்சிதறல்" },
      { id: "D", text: "Interference", textEn: "Interference", textTa: "குறுக்கீட்டு விளைவு" },
    ],
    expEn: "Atmospheric refraction occurs as starlight passes through fluctuating layers of varying refractive indices in Earth's atmosphere.",
    expTa: "பூமியின் வளிமண்டலத்தில் வெவ்வேறு ஒளிவிலகல் எண்கள் கொண்ட அடுக்குகளின் வழியே ஒளி செல்லும்போது ஏற்படும் வளிமண்டல ஒளிவிலகலே விண்மீன்கள் மின்னுவதற்குக் காரணமாகும்.",
  },
  {
    num: 6,
    qEn: "The work function of a metal depends on:",
    qTa: "ஒரு உலோகத்தின் வெளியேற்று ஆற்றல் எதனைப் பொறுத்தது?",
    options: [
      { id: "A", text: "Nature of the metal surface", textEn: "Nature of the metal surface", textTa: "உலோகப் பரப்பின் தன்மை" },
      { id: "B", text: "Frequency of incident light", textEn: "Frequency of incident light", textTa: "படுகின்ற ஒளியின் அதிர்வெண்" },
      { id: "C", text: "Intensity of light", textEn: "Intensity of light", textTa: "ஒளியின் செறிவு" },
      { id: "D", text: "Potential difference", textEn: "Potential difference", textTa: "மின்னழுத்த வேறுபாடு" },
    ],
    expEn: "Work function W₀ is a characteristic property of the material and state of the surface of the metal.",
    expTa: "வெளியேற்று ஆற்றல் (W₀) என்பது உலோகத்தின் பொருள் தன்மை மற்றும் அதன் பரப்பின் இயல்பைப் பொறுத்த மாறிலியாகும்.",
  },
  {
    num: 7,
    qEn: "In nuclear fission of U-235, the average number of neutrons released per fission is about:",
    qTa: "U-235 இன் அணுக்கரு பிளவில் ஒரு பிளவிற்கு வெளிப்படும் சராசரி நியூட்ரான்களின் எண்ணிக்கை:",
    options: [
      { id: "A", text: "1.5", textEn: "1.5", textTa: "1.5" },
      { id: "B", text: "2.5", textEn: "2.5", textTa: "2.5" },
      { id: "C", text: "3.5", textEn: "3.5", textTa: "3.5" },
      { id: "D", text: "4.5", textEn: "4.5", textTa: "4.5" },
    ],
    expEn: "Thermal neutron fission of uranium-235 yields an average of 2.5 prompt neutrons per fission event.",
    expTa: "U-235 அணுக்கரு பிளவு வினையில் ஒரு பிளவிற்கு சராசரியாக 2.5 நியூட்ரான்கள் உமிழப்படுகின்றன.",
  },
  {
    num: 8,
    qEn: "In an unbiased p-n junction, the width of the depletion region is of the order of:",
    qTa: "பின்னோக்கு சார்பற்ற p-n சந்தியில், விலக்கப்பட்ட பகுதியின் அகலம் எந்த அளவில் இருக்கும்?",
    options: [
      { id: "A", text: "1 mm", textEn: "1 mm", textTa: "1 மி.மீ" },
      { id: "B", text: "1 µm", textEn: "1 µm", textTa: "1 மைக்ரோமீட்டர் (1 µm)" },
      { id: "C", text: "1 nm", textEn: "1 nm", textTa: "1 நானோமீட்டர் (1 nm)" },
      { id: "D", text: "1 cm", textEn: "1 cm", textTa: "1 செ.மீ" },
    ],
    expEn: "The depletion layer formed by diffusion of electrons and holes has typical thickness of 0.5 to 1 micrometer (10⁻⁶ m).",
    expTa: "எலக்ட்ரான்கள் மற்றும் துளைகளின் பரவலால் உருவாகும் இயக்கமில்லாப் பகுதியின் தடிமன் தோராயமாக 1 மைக்ரோமீட்டர் (10⁻⁶ மீ) அளவில் இருக்கும்.",
  },
  {
    num: 9,
    qEn: "The ratio of magnetic length to geometric length of a bar magnet is approximately:",
    qTa: "ஒரு சட்ட காந்தத்தின் காந்த நீளத்திற்கும் வடிவியல் நீளத்திற்கும் இடையேயான விகிதம் தோராயமாக:",
    options: [
      { id: "A", text: "0.84", textEn: "0.84", textTa: "0.84 (அதாவது 5/6)" },
      { id: "B", text: "0.5", textEn: "0.5", textTa: "0.5" },
      { id: "C", text: "1.0", textEn: "1.0", textTa: "1.0" },
      { id: "D", text: "1.2", textEn: "1.2", textTa: "1.2" },
    ],
    expEn: "Magnetic poles reside slightly inside the physical ends; Magnetic length / Geometric length = 5/6 ≈ 0.84.",
    expTa: "காந்த முனைகள் சற்று உள்பக்கமாக அமைந்திருப்பதால், காந்த நீளம் / வடிவியல் நீளம் = 5/6 ≈ 0.84 ஆகும்.",
  },
  {
    num: 10,
    qEn: "Self-inductance of a coil does not depend on:",
    qTa: "ஒரு கம்பிச்சுருளின் தன் மின் தூண்டல் எண் எதனைச் சார்ந்தது அல்ல?",
    options: [
      { id: "A", text: "Number of turns", textEn: "Number of turns", textTa: "சுற்றுகளின் எண்ணிக்கை" },
      { id: "B", text: "Area of cross-section", textEn: "Area of cross-section", textTa: "குறுக்குவெட்டுப் பரப்பு" },
      { id: "C", text: "Current flowing through it", textEn: "Current flowing through it", textTa: "பாயும் மின்னோட்டம்" },
      { id: "D", text: "Permeability of core", textEn: "Permeability of core", textTa: "உள்ளகத்தின் உட்புகுதிறன்" },
    ],
    expEn: "Self-inductance L = μ₀ μᵣ n² A l depends only on geometry and core material, not on the flowing current.",
    expTa: "தன் மின் தூண்டல் எண் L = μ n² A l வடிவியல் அளவு மற்றும் ஊடகத்தை மட்டுமே சார்ந்தது; பாயும் மின்னோட்டத்தைச் சார்ந்தது அல்ல.",
  },
  {
    num: 11,
    qEn: "Light waves can be polarized because they are:",
    qTa: "ஒளி அலைகள் தளவிளைவுக்கு உட்படுத்தப்படலாம் ஏனெனில் அவை:",
    options: [
      { id: "A", text: "Transverse waves", textEn: "Transverse waves", textTa: "குறுக்கலைகள்" },
      { id: "B", text: "Longitudinal waves", textEn: "Longitudinal waves", textTa: "நெட்டலைகள்" },
      { id: "C", text: "Mechanical waves", textEn: "Mechanical waves", textTa: "இயந்திர அலைகள்" },
      { id: "D", text: "Electromagnetic waves", textEn: "Electromagnetic waves", textTa: "மின்காந்த அலைகள்" },
    ],
    expEn: "Polarization is a unique phenomenon exhibited strictly by transverse waves where vibrations are perpendicular to wave propagation.",
    expTa: "தளவிளைவு என்பது குறுக்கலைகளின் தனித்துவமான பண்பாகும்; இதில் அதிர்வுகள் அலை பரவும் திசைக்கு செங்குத்தாக அமையும்.",
  },
  {
    num: 12,
    qEn: "The de Broglie wavelength of an electron accelerated through V volts is given by:",
    qTa: "V வோல்ட் மின்னழுத்தத்தால் முடுக்கப்படும் எலக்ட்ரானின் டி-பிராய் அலைநீளம்:",
    options: [
      { id: "A", text: "12.27 / √V Å", textEn: "12.27 / √V Å", textTa: "12.27 / √V Å" },
      { id: "B", text: "1.227 / √V Å", textEn: "1.227 / √V Å", textTa: "1.227 / √V Å" },
      { id: "C", text: "0.1227 / √V Å", textEn: "0.1227 / √V Å", textTa: "0.1227 / √V Å" },
      { id: "D", text: "122.7 / √V Å", textEn: "122.7 / √V Å", textTa: "122.7 / √V Å" },
    ],
    expEn: "λ = h / √(2m e V) = 1.227 / √V nm = 12.27 / √V Å.",
    expTa: "λ = h / √(2meV) சமன்பாட்டில் மாறிலிகளைப் பிரதியிட λ = 12.27 / √V Å எனக் கிடைக்கும்.",
  },
  {
    num: 13,
    qEn: "The mass defect per nucleon in a nucleus is called its:",
    qTa: "ஓர் அணுக்கருவின் ஒரு நியூக்ளியானுக்கான நிறை குறைபாடு இவ்வாறு அழைக்கப்படுகிறது:",
    options: [
      { id: "A", text: "Packing fraction", textEn: "Packing fraction", textTa: "பொதிவுக் பின்னம்" },
      { id: "B", text: "Binding energy", textEn: "Binding energy", textTa: "பிணைப்பு ஆற்றல்" },
      { id: "C", text: "Binding energy per nucleon", textEn: "Binding energy per nucleon", textTa: "ஒரு நியூக்ளியானுக்கான பிணைப்பு ஆற்றல்" },
      { id: "D", text: "Nuclear density", textEn: "Nuclear density", textTa: "அணுக்கரு அடர்த்தி" },
    ],
    expEn: "Packing fraction f = Δm / A, representing the mass defect per nucleon.",
    expTa: "ஓர் அணுக்கருவின் நிறை குறைபாட்டை அதன் நிறை எண்ணால் வகுக்கக் கிடைப்பது பொதிவுக் பின்னம் (Packing Fraction) ஆகும்.",
  },
  {
    num: 14,
    qEn: "A zener diode is primarily used as a:",
    qTa: "ஜீனர் டையோடு முதன்மையாக எதற்காகப் பயன்படுகிறது?",
    options: [
      { id: "A", text: "Voltage regulator", textEn: "Voltage regulator", textTa: "மின்னழுத்த சீரமைப்பி" },
      { id: "B", text: "Rectifier", textEn: "Rectifier", textTa: "திருத்தி" },
      { id: "C", text: "Amplifier", textEn: "Amplifier", textTa: "பெருக்கி" },
      { id: "D", text: "Oscillator", textEn: "Oscillator", textTa: "அலைஇயற்றி" },
    ],
    expEn: "Operating in reverse breakdown region, a Zener diode maintains constant voltage across its terminals despite load current variations.",
    expTa: "பின்னோக்கு முறிவு மண்டலத்தில் இயங்கும் ஜீனர் டையோடு, சுமை மின்னோட்டம் மாறினாலும் மாறாத நிலையான மின்னழுத்தத்தை வழங்குவதால் மின்னழுத்த சீரமைப்பியாகப் பயன்படுகிறது.",
  },
  {
    num: 15,
    qEn: "Which modulation technique is most immune to atmospheric noise?",
    qTa: "வளிமண்டல இரைச்சலால் பாதிக்கப்படாத பண்பேற்ற முறை எது?",
    options: [
      { id: "A", text: "Frequency Modulation (FM)", textEn: "Frequency Modulation (FM)", textTa: "அதிர்வெண் பண்பேற்றம் (FM)" },
      { id: "B", text: "Amplitude Modulation (AM)", textEn: "Amplitude Modulation (AM)", textTa: "வீச்சுப் பண்பேற்றம் (AM)" },
      { id: "C", text: "Phase Modulation (PM)", textEn: "Phase Modulation (PM)", textTa: "கட்டப் பண்பேற்றம் (PM)" },
      { id: "D", text: "Pulse Width Modulation", textEn: "Pulse Width Modulation", textTa: "துடிப்பு அகலப் பண்பேற்றம் (PWM)" },
    ],
    expEn: "Atmospheric noise primarily causes amplitude variations, leaving FM frequency-encoded signals largely unaffected.",
    expTa: "இயற்கை மற்றும் வளிமண்டல இரைச்சல் வீச்சையே பாதிக்கிறது; அதிர்வெண்ணைப் பாதிக்காததால் அதிர்வெண் பண்பேற்றம் (FM) மிகச் சிறந்த இரைச்சல் தடுப்புத் திறன் கொண்டது.",
  },
];

async function updatePhysicsQuestions() {
  console.log("Updating PHY-12 exam questions in Turso cloud DB with full bilingual options...");

  const phyExamRes = await client.execute("SELECT id FROM ExamSchedule WHERE subjectId IN (SELECT id FROM Subject WHERE code = 'PHY-12');");
  if (phyExamRes.rows.length === 0) {
    console.log("No PHY-12 exam schedule found.");
    return;
  }

  const examId = phyExamRes.rows[0].id;
  console.log("Found PHY-12 ExamSchedule ID:", examId);

  for (const item of PHYSICS_BILINGUAL) {
    const optionsJson = JSON.stringify(item.options);
    const explanationBilingual = `${item.expEn} / ${item.expTa}`;
    await client.execute({
      sql: `UPDATE ExamQuestion 
            SET options = ?, explanation = ?
            WHERE examScheduleId = ? AND questionNumber = ?;`,
      args: [optionsJson, explanationBilingual, examId, item.num],
    });
  }

  console.log("✅ All 15 PHY-12 questions updated with verified Tamil + English options!");
}

updatePhysicsQuestions().catch(console.error);

