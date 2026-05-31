import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const outlinePath = path.join(projectRoot, "requirements", "gliederung.json");
const outputPath = path.join(projectRoot, "runtime", "knowledge", "base.json");

const outline = JSON.parse(fs.readFileSync(outlinePath, "utf8"));

const rootConfig = {
  "Session Architecture": {
    color: "color_sand",
    icon: "icon_git_branch",
    discipline: "discipline_integrated",
  },
  Breathwork: {
    color: "color_blue",
    icon: "icon_wind",
    discipline: "discipline_breathwork",
  },
  "Breathwork Protocols": {
    color: "color_teal",
    icon: "icon_activity",
    discipline: "discipline_breathwork",
  },
  Meditation: {
    color: "color_indigo",
    icon: "icon_moon_star",
    discipline: "discipline_meditation",
  },
  "Deep Rest": {
    color: "color_emerald",
    icon: "icon_bed_double",
    discipline: "discipline_deep_rest",
  },
  "Preparatory & Support Practices": {
    color: "color_amber",
    icon: "icon_compass",
    discipline: "discipline_integrated",
  },
  "Full Practice Formats": {
    color: "color_rose",
    icon: "icon_layers_3",
    discipline: "discipline_integrated",
  },
  "Concept Cards": {
    color: "color_slate",
    icon: "icon_book_open",
    discipline: "discipline_integrated",
  },
};

const idOverrides = {
  "Session Architecture": "session-architecture",
  Breathwork: "breathwork",
  "Breathwork Protocols": "breathwork-protocols",
  Meditation: "meditation",
  "Deep Rest": "deep-rest",
  "Preparatory & Support Practices": "preparatory-support-practices",
  "Full Practice Formats": "full-practice-formats",
  "Concept Cards": "concept-cards",
  "Breathwork > Breathwork Techniques > Down Regulation": "down-regulation-techniques",
  "Breathwork Protocols > NSRT Protocols > Down Regulation": "down-regulation-protocols",
  "Breathwork > Breathwork Techniques > Up Regulation": "up-regulation-techniques",
  "Breathwork Protocols > NSRT Protocols > Up Regulation": "up-regulation-protocols",
  "Meditation > Meditation Concepts": "meditation-concepts",
  "Concept Cards > Meditation Concepts": "concept-meditation-concepts",
  "Breathwork Protocols > NSRT Protocols > Balanced": "balanced-nsrt-protocols",
  "Breathwork Protocols > NSRT Protocols > Restorative": "restorative-nsrt-protocols",
  "Breathwork Protocols > NSRT Protocols > Up Regulation": "up-regulation-protocols",
  "Breathwork Protocols > NSRT Protocols > Down Regulation": "down-regulation-protocols",
  "Breathwork Protocols > NSRT Protocols > CTS — Circle / Triangle / Square":
    "cts-circle-triangle-square",
  "Breathwork Protocols > NSRT Protocols > 360° IPA": "360-ipa",
  "Full Practice Formats > Full Session Combinations > Breathwork + Meditation + Deep Rest":
    "breathwork-meditation-deep-rest",
  "Full Practice Formats > Full Session Combinations > Meditation + Deep Rest":
    "meditation-deep-rest",
  "Full Practice Formats > Full Session Combinations > NSRT + Meditation + Stillness":
    "nsrt-meditation-stillness",
  "Full Practice Formats > Full Session Combinations > Gentle 10 + Exhale": "gentle-10-exhale",
  "Concept Cards > Core Practice Concepts > Close your eyes, be still, just breathe":
    "close-your-eyes-be-still-just-breathe",
  "Concept Cards > Core Practice Concepts > Notice what you notice, feel what you feel":
    "notice-what-you-notice-feel-what-you-feel",
  "Concept Cards > Stress & Rest Concepts > Stimulus → Response Gap": "stimulus-response-gap",
  "Meditation > Meditation Concepts > Acknowledge, don’t indulge": "acknowledge-dont-indulge",
};

const mergeByTitle = {
  "4-Part Breathing Architecture": "4-part-breathing-architecture",
  "6 Phases of Non-doing": "6-phases-of-non-doing",
  "Active / Passive / Recovery Breathing": "active-passive-recovery-breathing",
  "Being Technique": "being-technique",
  "Down Regulation / Up Regulation": "down-regulation-up-regulation",
  "Established in Being": "established-in-being",
  "Focused Intention": "focused-intention",
  "Present Moment Awareness": "present-moment-awareness",
  "Quality / Quantity / Capacity Axis": "quality-quantity-capacity-axis",
  "Witness State": "witness-state",
};

const forcedConceptTitles = new Set([
  "Systematic Breathwork",
  "Experiential Breathwork",
  "3 Depths of Practice",
  "Quiet Practices",
]);

const forcedEmptyContentIds = new Set([
  "session-architecture",
  "breathwork-protocols",
  "preparatory-support-practices",
  "full-practice-formats",
  "concept-cards",
  "opening-invitation",
  "integration-teaching-methods",
  "principles-of-guidance",
  "session-structure",
  "session-frameworks",
  "deep-rest-principles",
  "deep-rest-practices",
  "guiding-principles",
  "reference-views",
]);

const contentOverrides = {
  "session-architecture": {
    overview:
      "How Just Breathe sessions are opened, structured, and closed in a clear teaching flow.",
    details:
      "The main scaffolding for guided practice includes the shared practice arc, opening and closing moves, and the distinct frameworks used for breathwork and meditation sessions.",
  },
  breathwork: {
    overview:
      "Core breathwork foundations, concepts, and techniques for regulation, awareness, and guided change.",
    details:
      "Breathwork in this curriculum ranges from simple awareness and mechanics to systematic state change. Use this section to move from principles and distinctions into concrete techniques and teaching language.",
  },
  "breathwork-protocols": {
    overview:
      "Structured breathwork methods, NSRT patterns, and reusable practice sequences.",
    details:
      "These cards collect the named protocol systems used to package techniques into repeatable experiences. They are useful when designing, recalling, or teaching longer practice arcs rather than single methods.",
  },
  meditation: {
    overview:
      "Meditation foundations, techniques, and key concepts across the three depths of practice.",
    details:
      "Meditation in Just Breathe is approached through awareness, being, observation, and intention. This section links the conceptual frame with the actual practices used in sessions.",
  },
  "deep-rest": {
    overview:
      "Deep rest as a dedicated branch of unwinding, support, stillness, and integration.",
    details:
      "Deep rest is treated as a quiet practice in its own right, not only as a recovery add-on. These cards group the principles and formats that support settling, softening, and post-practice integration.",
  },
  "preparatory-support-practices": {
    overview:
      "Supportive setup, movement, and reset practices that help sessions land well.",
    details:
      "Practices around the edges of the main modalities include preparation, orientation, setup, and direct support tools that help a participant arrive, regulate, and continue safely.",
  },
  "full-practice-formats": {
    overview:
      "Longer practice formats and combinations that bundle multiple modalities into one session.",
    details:
      "These cards are useful when composing complete experiences rather than isolated techniques. They collect signature practices and mixed-format combinations for guided delivery.",
  },
  "concept-cards": {
    overview:
      "Cross-cutting concept cards for language, models, and memorable anchors used across the curriculum.",
    details:
      "Concept cards provide a second entry into the material. Instead of following the course structure alone, they gather the ideas, distinctions, and teaching anchors that become useful during recall, guidance, and study.",
  },
  "opening-sequence": {
    overview:
      "The ritual start of a Just Breathe practice, used to gather attention and mark transition.",
    details:
      "The opening sequence helps participants shift from outer stimulation toward inner attention. In the manual it is framed as a meaningful invitation rather than a purely technical instruction.",
  },
  "closing-sequence": {
    overview:
      "The deliberate transition out of practice so the session lands clearly and gently.",
    details:
      "Closing is part of the method, not an afterthought. It helps participants reorient, absorb what happened, and move on without abruptly leaving the state created during practice.",
  },
  "breathwork-session-framework": {
    overview:
      "The main session shape for guiding a breathwork experience from arrival to completion.",
    details:
      "A breathwork session follows a dedicated arc from arrival through active practice into settling and completion. The emphasis is on pacing, regulation, and technique choice that fit the participant and the intended state shift.",
  },
  "meditation-session-framework": {
    overview:
      "The main session shape for guiding meditation with a clear arc and pacing.",
    details:
      "A meditation session follows a dedicated arc shaped by attention, awareness, and the chosen depth of practice. The pacing is usually simpler and quieter than an active breathwork session, with more room for observation and settling.",
  },
  "integration-recovery-stillness": {
    overview:
      "A combined reference point for settling, absorbing, and allowing practice to land.",
    details:
      "Integration, recovery, and stillness describe the quieter phase in which practice settles into the system. They help bridge the transition from active guidance toward rest, reflection, and steadier presence.",
  },
  "universal-practice-framework": {
    overview:
      "A shared frame for guiding quiet practices with consistency across modalities.",
    details:
      "A shared practice framework creates continuity across breathwork, meditation, and rest. Common teaching moves such as arrival, orientation, guided experience, and landing help different session types feel coherent and safe.",
  },
  "functional-breath-awareness": {
    overview:
      "A foundational lens for noticing how breathing is happening before trying to change it.",
    details:
      "Functional breath awareness starts with observation. It supports sensing patterns, capacity, and present-state information so later interventions are more precise and more appropriate.",
  },
  "conscious-breath": {
    overview: "A slow, considered breath for centering and immediate awareness.",
    details:
      "How to practice:\nSit or stand and bring attention completely onto the breath.\n- Take a conscious inhale without needing to make it especially deep.\n- Exhale with ease through an open or closed mouth.\n- Repeat as needed.\n- Continue for 10 rounds or about 60 seconds.\n\nPurpose:\nUsed at the beginning of practice or whenever a reset into clear present-moment awareness is needed. The emphasis is quality, intention, and centering rather than quantity.\n\nWhy it works:\nThe manual describes this as a quality inhale and exhale that signals focus and intention. Deliberately bringing attention onto one steady breath helps gather awareness into the body and reset the system into the moment.",
  },
  "recovery-breath": {
    overview: "A deliberate return from an active round back to natural breathing.",
    details:
      "How to practice:\nUse this immediately after a breathing round has finished.\n- Take a full inhale at the completion of the last breath.\n- Hold briefly and acknowledge the transition.\n- Exhale fully with an extended breath to begin down-regulating.\n- Let the exhale be through an open or closed mouth.\n- Allow the breathing pattern to return to a natural pace and flow.\n\nPurpose:\nUsed to complete a round without abruptly stopping. The emphasis is transition, recovery, and a conscious return to a natural breath.\n\nWhy it works:\nThe manual presents recovery breath as a variation of conscious breath used intentionally after a round. The held transition and extended exhale help shift the system away from active technique and toward down-regulation and a more natural rhythm.",
  },
  "diaphragmatic-breathing": {
    overview: "Deep belly breathing that fully engages the diaphragm.",
    details:
      "How to practice:\nFind a comfortable seat or a symmetrical standing position.\n- Notice the current pace of the breath.\n- Take a conscious breath to begin.\n- Place one hand on the belly and one hand on the chest.\n- Breathe slowly and fully into the belly and let it expand.\n- Pause at the top for about 1 second.\n- Exhale slowly and let the belly empty.\n- Repeat for 10 rounds or about 60 seconds.\n\nPurpose:\nUsed as a foundational regulation technique and as a calming response during stress or anxiousness. The emphasis is nervous-system regulation and a parasympathetic response.\n\nWhy it works:\nThe manual describes diaphragmatic breathing as fully engaging the diaphragm and increasing the efficiency of the lungs. That fuller diaphragmatic action supports better breathing mechanics and is presented as a direct way to regulate the nervous system and create a calming effect.",
  },
  "costal-breath-chest-breathing": {
    overview: "Chest-focused breathing that emphasizes the intercostal muscles.",
    details:
      "How to practice:\nFind a comfortable seat or symmetrical standing position.\n- Notice the current pace of the breath.\n- Take a conscious breath to begin.\n- Breathe slowly into the chest and feel the expansion of the intercostal muscles.\n- Exhale slowly and let the chest empty.\n- Repeat for 10 rounds or about 60 seconds.\n\nPurpose:\nUsed to bring awareness to chest-dominant breathing mechanics. The emphasis is recognizing how the ribs and chest participate in the breath.\n\nWhy it works:\nThe manual explains that costal breathing requires contraction of the intercostal muscles and that air leaves the lungs passively as those muscles relax. Practising it deliberately makes the mechanics of shallow or chest-led breathing easier to feel and understand.",
  },
  "clavicular-breath-upper-chest-breathing": {
    overview: "Upper-chest breathing that lifts the rib cage through the chest and neck muscles.",
    details:
      "How to practice:\nBegin by noticing the natural state of the breath.\n- Breathe into the upper chest and lower throat space.\n- Feel the expansion in a 360 direction rather than only up and down.\n- Repeat for 10 rounds or about 60 seconds.\n\nPurpose:\nUsed to sense the uppermost breathing pattern and recognize how the shoulders, upper chest, and throat can become involved. The emphasis is awareness of high chest breathing rather than relaxation.\n\nWhy it works:\nThe manual states that clavicular breathing relies on the muscles of the chest, shoulders, upper back, and neck to elevate the upper rib cage. Practising it consciously makes that compensatory pattern easier to identify and differentiate from diaphragmatic or costal breathing.",
  },
  "even-breath": {
    overview: "Equal-length inhale and exhale for calm and baseline regulation.",
    details:
      "How to practice:\nFind a comfortable seat and notice the current pace of the breath.\n- Take a conscious breath to begin.\n- Inhale slowly for a count of 4 or a similar slow count.\n- Take a natural pause of about 1 second at the top.\n- Exhale for the same count of 4.\n- Continue for 30 rounds or about 2 minutes.\n- Adjust the count if needed so the pattern creates calm and ease.\n- Release the technique and return to a natural breath when complete.\n\nPurpose:\nUsed to soothe body and mind, slow the breathing cycle, and establish a comprehensive baseline for later techniques. The emphasis is steadiness and ease.\n\nWhy it works:\nThe manual describes even breath as steady inhalation and exhalation of equal duration that helps down-regulate the nervous system. Equal timing slows the cycle and gives the body a simple, non-forceful rhythm to follow.",
  },
  "360-breathing": {
    overview: "Full-torso breathing that emphasizes circumferential expansion.",
    details:
      "How to practice:\nFind a comfortable seat with one hand on the belly and one hand on the chest.\n- Breathe slowly and fully into both belly and chest equally.\n- Feel both hands rise and expand.\n- Focus on expansion moving evenly in a 360 degree direction.\n- Pause at the top for about 1 second.\n- Exhale slowly and let belly and chest empty.\n- Repeat for 10 rounds or about 60 seconds.\n\nPurpose:\nUsed to encourage a fuller breath, even rib-cage expansion, and greater torso breath capacity. The emphasis is distribution and fullness rather than speed or intensity.\n\nWhy it works:\nThe manual describes 360 breathing as a circumferential variation of belly and chest breathing that encourages full breath and oxygen distribution with even rib-cage inflation. The all-around expansion helps the practitioner feel the whole torso participating in the breath.",
  },
  "coherent-breath": {
    overview: "Slow rhythmic breathing at about 5.5 breaths per minute.",
    details:
      "How to practice:\nBreathe with a slow, even rhythm.\n- Inhale into the belly for about five seconds.\n- Exhale for about five seconds.\n- Continue for three to five minutes.\n- Keep the breath natural rather than robotic or exaggerated.\n\nPurpose:\nUsed to create a steady rhythm and increase heart rate variability. The emphasis is coherence, natural slowness, and nervous-system regulation through pacing.\n\nWhy it works:\nThe manual defines coherent breathing as breathing at about 5.5 breaths per minute and states that its purpose is to increase heart rate variability. The slower, even pace gives the cardiovascular and respiratory systems a more coherent rhythm to follow.",
  },
  "365-method": {
    overview: "A daily stress-countering pattern built from coherent breathing.",
    details:
      "How to practice:\nUse coherent breathing as the base pattern.\n- Practice three times a day.\n- Breathe six times per minute.\n- Inhale for 5 and exhale for 5.\n- Continue for five minutes.\n- Repeat across all 365 days of the year.\n\nPurpose:\nUsed as a simple clinical-style recommendation to counter accumulated stress. The emphasis is consistency, repetition, and daily nervous-system support.\n\nWhy it works:\nThe manual presents the method as a common recommendation from clinical professionals and ties it directly to coherent breathing. The effect comes less from novelty and more from regular repetition of a slow, even breathing pattern across the day and year.",
  },
  "box-breathing": {
    overview: "A four-part equal-ratio breath for steadiness and clarity.",
    details:
      "How to practice:\nFind a comfortable seat and notice the current pace of the breath.\n- Take a conscious breath to begin.\n- Inhale slowly for a count of 4.\n- Hold at the top for a count of 4.\n- Exhale slowly for a count of 4.\n- Continue for 30 rounds or about 2 minutes.\n- Adjust the count if needed so the pattern remains supportive.\n- Release the technique and return to a natural breath when complete.\n\nPurpose:\nUsed to reduce physical stress symptoms and increase mental clarity. The emphasis is equal structure across all four parts of the breath.\n\nWhy it works:\nThe manual describes box breathing as a technique in which inhalation, internal retention, exhalation, and external retention are all of equal length. That equal structure creates a stable rhythm that supports steadiness, pacing, and clearer concentration.",
  },
  "inspired-pause": {
    overview: "A breath practice that highlights the pause after inhalation.",
    details:
      "How to practice:\nFind a comfortable seat and begin with a conscious breath.\n- Inhale slowly to a comfortable and manageable level.\n- Pause without force and without distinct muscular gripping.\n- Hold for about 2 seconds or a similar slow count.\n- Exhale gently.\n- Increase or decrease the pause as preferred.\n\nPurpose:\nUsed to create non-physical ease, slow the heart rate, and expand lung capacity. The emphasis is the intentional pause rather than only the movement of air.\n\nWhy it works:\nThe manual stresses that value in breathing is not only in inhaling and exhaling but also in the moments when we are not breathing in or out. The significant pause shifts attention into that gap and is presented as a way to slow the heart rate and increase spaciousness in the breath.",
  },
  "alternate-nostril-breathing": {
    overview: "Alternating nostrils to balance breath, attention, and nervous-system tone.",
    details:
      "How to practice:\nSit comfortably and lift the right hand to the nose.\n- Close the right nostril with the thumb and inhale slowly through the left nostril.\n- Close the left nostril with the ring finger while releasing the right.\n- Exhale through the right nostril.\n- Pause briefly, then inhale through the right nostril.\n- Close the right nostril, open the left, and exhale through the left.\n- This completes one round. Continue for several rounds.\n\nPurpose:\nUsed to calm the nervous system, cultivate concentration, balance left and right hemispheric activity, and balance masculine and feminine energy. The emphasis is balancing rather than strong activation in one direction.\n\nWhy it works:\nThe manual links the alternating pattern with calming the nervous system and fostering mental clarity. The side-to-side switching creates a deliberate attentional rhythm and gives the practitioner a more structured relationship to the inhale and exhale.",
  },
  "3-part-inhale-exhale": {
    overview: "A segmented inhale and exhale with short pauses throughout the cycle.",
    details:
      "How to practice:\nFind a comfortable seat or reclined position and take a few clearing breaths.\n- Inhale the first third of the breath.\n- Pause briefly.\n- Inhale the next third.\n- Pause briefly.\n- Inhale the final third until the lungs are full.\n- Pause at the top.\n- Exhale one third.\n- Pause briefly.\n- Exhale the next third.\n- Pause briefly.\n- Exhale the final third until the lungs are empty.\n- Pause again.\n- Repeat for a few rounds.\n\nPurpose:\nUsed to slow the breath and create calm and ease. The emphasis is segmentation, pacing, and greater awareness of the whole breathing cycle.\n\nWhy it works:\nThe manual describes the brief pauses during both inhale and exhale as the element that helps slow the breath down. Breaking the cycle into thirds makes each phase more conscious and reduces the tendency to rush through the breath.",
  },
  "4-part-breathing-architecture": {
    overview: "A simple map of the four phases of a breath cycle.",
    details:
      "Breathing can be understood as a repeating cycle with four phases:\n\n1. Inhale\n2. Internal pause after inhale\n3. Exhale\n4. External pause after exhale\n\nThis structure helps show where a technique places its emphasis. Some practices lengthen the inhale, some extend the exhale, some introduce pauses, and some smooth the whole cycle into a steadier rhythm.\n\nUnderstanding the four phases makes it easier to compare techniques, guide pacing, and notice how different parts of the breath influence calm, focus, effort, or activation.\n\nImportant to remember:\n- Every breath pattern changes one or more phases of the cycle.\n- Longer exhales often support settling.\n- Pauses can change intensity and concentration.\n- The right pattern depends on the aim of the practice.",
  },
  "systematic-breathwork": {
    overview:
      "Breathwork used intentionally to create a clear and repeatable state shift.",
    details:
      "Systematic breathwork differs from loose experimentation by using chosen mechanics, pacing, and dosage to support a known effect. It is central to the curriculum's practical teaching approach.",
  },
  "experiential-breathwork": {
    overview:
      "Breath-led experience that emphasizes felt exploration more than narrow regulation goals.",
    details:
      "Experiential breathwork leans toward felt exploration rather than narrowly defined regulation outcomes. The emphasis is on direct experience, inner observation, and allowing the breath to reveal patterns, responses, and shifts.",
  },
  "nervous-system-recognition": {
    overview:
      "Recognizing state before intervening, so breath choices fit the person and moment.",
    details:
      "Recognition comes first. The curriculum repeatedly points toward learning to notice signs of activation, settling, overwhelm, and capacity before selecting a technique.",
  },
  "nervous-system-regulation": {
    overview:
      "Using breath and attention to help the system move toward steadier, more workable states.",
    details:
      "Regulation here means guiding change with enough structure to support safety and usability. It can involve calming, balancing, restoring, or energising depending on context.",
  },
  "nervous-system-release": {
    overview:
      "The release side of practice, where stored activation begins to move or unwind.",
    details:
      "Release is related to regulation but not identical to it. The system may move beyond simple calming into a deeper unwinding of held activation, tension, or accumulated charge.",
  },
  "nsrt-method": {
    overview:
      "The NSRT method as the named umbrella for nervous system regulation techniques.",
    details:
      "The method gathers techniques into a practical framework for balancing, down-regulating, up-regulating, and restoring. The protocol families below show how the framework is organized in use.",
  },
  "physiological-sigh": {
    overview: "A simple down-regulating stress-response breath.",
    details:
      "How to practice:\nBegin by noticing the current quality of the breath.\n- Take a full inhale through the nose.\n- Take a second inhale through the nose at a smaller capacity, filling the intake to maximum.\n- Pause briefly at the top.\n- Open the mouth and sigh out with an extended exhale.\n- Repeat for 5-10 rounds.\n\nPurpose:\nUsed to respond to stress, anxiety, overwhelm, or over-stimulation. The emphasis is rapid down-regulation and a quick shift out of an activated stress response.\n\nWhy it works:\nThe manual describes the physiological sigh as a simple and effective down-regulating stress-response breath. In the protocol material it is also used to activate the body's relaxation response by helping to reduce sympathetic over-activation through the long sighing exhale.",
  },
  "extended-exhale": {
    overview: "A slow controlled exhale-led pattern for quick down-regulation.",
    details:
      "How to practice:\nBreathe in slowly to a comfortably full level.\n- Do not add a pause.\n- Exhale long, slow, and deep through the mouth.\n- Let the exhale be audible like a sigh.\n- Repeat as needed.\n\nPurpose:\nUsed to quickly down-regulate the nervous system, activate the parasympathetic nervous system, and support relaxation and tension decompression. The emphasis is the longer exhale with no breath-holding between phases.\n\nWhy it works:\nThe manual explicitly frames this as a release technique in which the exhale is longer than the inhale. That longer sighing exhale is presented as the key mechanism for parasympathetic activation and for decompressing tension in real time.",
  },
  "triangle-breathing": {
    overview: "A three-part equal pattern of inhale, pause, and exhale.",
    details:
      "How to practice:\nFind a comfortable seat and notice the current pace of the breath.\n- Take a conscious breath to begin.\n- Inhale slowly for a count of 3.\n- Pause at the top for a count of 3.\n- Exhale slowly for a count of 3.\n- Continue for 10-12 rounds or about 2 minutes.\n- Adjust the count if needed so the pattern remains supportive.\n- Release the technique and return to a natural breath when complete.\n\nPurpose:\nUsed to slow down the breathing cycle and help down-regulate the nervous system. The emphasis is equal attention to inhale, pause, and exhale, especially for stress and anxiousness.\n\nWhy it works:\nThe manual identifies triangle breathing as a three-part technique with an even pattern across the whole cycle. That even pacing slows the breath down and gives the practitioner a simple structure for easing activation.",
  },
  "triangle-4-7-8": {
    overview: "An anxiety-focused triangle-breathing variation with a longer hold and exhale.",
    details:
      "How to practice:\nUse triangle breathing as the base pattern.\n- Inhale for a count of 4.\n- Pause and hold for a count of 7.\n- Exhale for a count of 8.\n- Repeat for 10-12 rounds or about 2 minutes.\n\nPurpose:\nUsed for managing anxiety and quelling errant stress responses. The emphasis is strengthening the mind-body connection through a deliberately slowed ratio.\n\nWhy it works:\nThe manual presents this Andrew Weil variation as especially effective for anxiety because the longer rhythm helps fortify the connection between mind and body. As the breathing slows and attention stays fully on the count, the parasympathetic nervous system is described as becoming engaged.",
  },
  "3-part-breathing": {
    overview: "Deep belly-and-chest breathing for oxygen intake and full-body calm.",
    details:
      "How to practice:\nFind a comfortable seat and notice the current pace of the breath.\n- Take a conscious breath to begin.\n- Place one hand on the belly and one hand on the chest.\n- Breathe slowly and fully into both belly and chest equally.\n- Feel both hands rise and expand.\n- Pause at the top for about 1 second.\n- Exhale slowly and let belly and chest empty.\n- Repeat for 10 rounds or about 60 seconds.\n\nPurpose:\nUsed to increase oxygen intake and create a full-body sense of calmness. The emphasis is internal movement of the breath together with a warming quality through the body.\n\nWhy it works:\nThe manual describes this as a deep-breathing technique that moves through both belly and chest. That combined expansion increases the felt movement of breath through the torso and is presented as useful both for calming the nerves and awakening the senses.",
  },
  "pinhole-breath": {
    overview: "A narrowed-lip exhale for slowing down and reducing real-time stress.",
    details:
      "How to practice:\nFind a comfortable seat and notice the breath without changing it.\n- Take a full inhale through the nose.\n- Part the lips slightly.\n- Exhale slowly through the lips as though breathing out through a small pinhole.\n- Pause at the end of the breath.\n- Repeat 10 times or for about 60 seconds.\n\nPurpose:\nUsed to slow the exhalation, down-regulate the nervous system, and reduce real-time stress. The emphasis is the controlled release through the narrowed lips.\n\nWhy it works:\nThe manual explicitly ties the pinhole shape to a slower exhale. That narrowing makes the out-breath more deliberate and extended, which supports down-regulation and interrupts more urgent stress breathing patterns.",
  },
  "low-frequency-humming-breath": {
    overview: "A gentle humming exhale for soothing the nervous system.",
    details:
      "How to practice:\nGently place the thumbs over each tragus with light pressure.\n- Let the remaining fingers rest naturally along the forehead.\n- With the mouth closed, inhale slowly to full capacity.\n- Exhale slowly while creating a gentle humming sound.\n- Repeat as needed.\n\nPurpose:\nUsed as a gentle down-regulation practice that soothes the nervous system and frees the mind of agitation. The emphasis is vibration, softness, and a calming exhale.\n\nWhy it works:\nThe manual states that the vibrations produced by the practice are known to soothe the nervous system and quiet agitation. The combination of closed-mouth breathing and low-frequency sound gives the exhale a steady, settling quality.",
  },
  "energising-breath": {
    overview: "A throat-regulated breath that warms, energises, and steadies the mind.",
    details:
      "How to practice:\nBegin by learning the throat action.\n- Exhale as though fogging a mirror and notice the gentle washing sound at the back of the throat.\n- Inhale with the same sound.\n- Practise this for a few rounds.\n- Keep the same throat activation but close the lips and exhale through the nose.\n- Practise for a few more rounds.\n- Then keep the mouth closed and breathe in and out through the nose with the same sound on both inhale and exhale.\n- Continue for about one minute and then release.\n\nPurpose:\nUsed to regulate the breath, warm and energise the body, and calm the mind. The emphasis is controlled throat activation together with a steady sounding breath.\n\nWhy it works:\nThe manual says the practice constricts the epiglottis so the breath washes across the back of the throat. That mechanical narrowing regulates airflow while also creating warmth and a more controlled respiratory rhythm.",
  },
  "cleansing-and-clearing-breath": {
    overview: "An active-exhale technique for heat, abdominal strength, and clearing.",
    details:
      "How to practice:\nFind a comfortable seat and bring awareness to the lower belly.\n- Take a long inhale through the nose.\n- Contract the abdominal muscles in quick but regulated succession to force out short exhalations.\n- Let the inhalation happen passively in response to the active exhalation.\n- Continue for about one minute.\n- Finish with a deep inhale through the nostrils and a slow exhale through the mouth.\n\nPurpose:\nUsed to create heat in the body, strengthen the abdomen, aid digestion, and clear the nadis. The emphasis is active abdominal exhalation with passive inhalation.\n\nWhy it works:\nThe manual explicitly identifies the active exhale and passive inhale as the defining mechanism. Repeated abdominal contractions create the pumping action that builds heat, strengthens the abdominal area, and gives the technique its clearing quality.",
  },
  "bellows-breath": {
    overview: "A forceful abdominal-and-diaphragmatic breath for heat and energy.",
    details:
      "How to practice:\nFind a comfortable seat.\n- Take a long inhale and exhale through the nose.\n- Inhale again and exhale by quickly contracting the abdominal muscles.\n- Follow this with a quick diaphragmatic inhale so the breath moves in and out in quick succession.\n- Continue for about one minute.\n- Finish with one long slow inhale through the nose and one slow exhale through the mouth.\n\nPurpose:\nUsed to strengthen the abdomen, drain excess mucus from the lungs, and energise body and mind. The emphasis is active inhalation and exhalation driven by the abdominals and diaphragm.\n\nWhy it works:\nThe manual describes both sides of the breath as active contractions of the abdominals and diaphragm. That strong respiratory pumping creates heat, mobilises the torso, and produces the energising effect the technique is known for.",
  },
  "abc123-method-practice-sequences": {
    overview:
      "A sequence-based method for designing themed breathwork experiences.",
    details:
      "ABC123 groups practices by felt intent and teaching arc. It is useful when shaping a full guided session rather than picking only one technique in isolation.",
  },
  "the-thinking-mind": {
    overview:
      "An introduction to meditation through the mind's activity rather than by fighting it.",
    details:
      "Meditation begins by meeting the activity of the mind directly instead of fighting it. Thoughts, impulses, and distractions become part of the field of practice and help clarify the role of awareness, witnessing, and non-doing.",
  },
  "witness-state": {
    overview:
      "The capacity to notice thoughts, sensations, and experience without fully becoming them.",
    details:
      "Witness state is a key meditation concept in the curriculum. It supports steadiness, perspective, and less entanglement with the constant movement of the mind.",
  },
  "non-doing": {
    overview:
      "Practice that moves away from forcing and toward allowing, resting, and simply noticing.",
    details:
      "Non-doing is a core meditation principle here. It is not passivity in the careless sense, but a disciplined softening of effort and control.",
  },
  awareness: {
    overview:
      "Awareness as the broad field of noticing that makes all other practice possible.",
    details:
      "Awareness is the broad field of noticing that comes before control or correction. Sensations, thoughts, emotions, breath, and environment can all be included without immediately needing to change them.",
  },
  attention: {
    overview:
      "Attention as the narrower placement of focus within the larger field of awareness.",
    details:
      "The distinction matters throughout the training. Awareness is broad and receptive; attention is the deliberate directing of focus to a chosen object or instruction.",
  },
  intention: {
    overview:
      "The felt and stated purpose that shapes how a practice is entered and guided.",
    details:
      "Intention helps frame practice without making it rigid. In teaching, it supports clarity, coherence, and a shared direction for the participant.",
  },
  "being-technique": {
    overview:
      "A core Just Breathe meditation approach centered on resting in being rather than doing.",
    details:
      "The being technique is one of the signature meditation references in the manual. It belongs to the established-in-being depth of practice and supports quieting through direct simplicity.",
  },
  "body-scan": {
    overview: "A guided inward scan of bodily sensation without judgement.",
    details:
      "How to practice:\nBring awareness through the body one location at a time.\n- Move in an ascending path from the ground up, or in a descending path when grounding is needed.\n- Name each location clearly and keep the language simple.\n- Use three points of focus for each location: the exact place, where it is in the body, and that same place described from the body's side.\n- After locating the area, invite present-moment awareness, softening, acknowledgment, and further ease.\n- Begin with a swallow to help shift awareness inward.\n\nPurpose:\nUsed to tune into the body, reconnect with the physical body, and cultivate attentiveness to the witness of present experience. Relaxation may happen, but the primary goal is not relaxation; it is awareness.\n\nWhy it works:\nThe manual says the practice helps move awareness inward both physiologically and mentally, especially when beginning with a swallow. Clear location-based guidance reduces mental drift and supports investigation, ease, and embodiment without judgement.",
  },
  "trataka-focused-gaze": {
    overview: "An eyes-open gazing practice for relentless attention.",
    details:
      "How to practice:\nChoose one external object such as a candle, cloud, or fixed point.\n- Keep the eyes open and let attention stay with that one object.\n- Hold the gaze with full commitment to the moment.\n- Notice when the mind tries to move elsewhere in thought or attention.\n- With practice, allow the external point to become an internal one even with closed eyes.\n\nPurpose:\nUsed to train relentless attention, especially for beginning students or for people who are not comfortable closing the eyes. The emphasis is external focus serving an internal meditative aim.\n\nWhy it works:\nThe manual explains that although the eyes are focused outward, the true purpose is inward. Watching one object reveals how the mind creates temptation and distraction, and over time this strengthens the capacity to keep attention steady.",
  },
  "watching-the-breath": {
    overview: "Simple observation of the breath without judgement or manipulation.",
    details:
      "How to practice:\nBring attention completely to the present moment of the breath.\n- Watch the breath.\n- Observe the breath.\n- Acknowledge the breath.\n- Let thoughts, emotions, and distractions pass without attachment.\n- Do not try to change the quantity or quality of the breath.\n- Stay fully committed to the present moment.\n\nPurpose:\nUsed to bypass thoughts, emotions, and distractions by placing attention on the breath alone. The emphasis is observation and acknowledgment rather than mantra, control, or analysis.\n\nWhy it works:\nThe manual says this signals to the mind that distractions have no place in the moment. Using the breath as an anchor without changing it shifts attention toward recognition and present-moment awareness rather than intellectual involvement.",
  },
  "loving-kindness-metta-bhavana": {
    overview: "A five-stage cultivation of love, kindness, and goodwill.",
    details:
      "How to practice:\nMove through the five traditional stages of the practice.\n- Begin with yourself and cultivate peace, calm, strength, confidence, and love.\n- Bring to mind someone you love and extend the same well-wishing toward them.\n- Include someone neutral or an acquaintance and reflect on their humanity.\n- Include someone difficult or an enemy and send love equally without feeding hatred.\n- Extend loving-kindness outward to everyone around you and finally to all beings everywhere.\n\nPurpose:\nUsed to cultivate loving-kindness as a felt quality of the heart. The emphasis is expanding the range of love from the self outward without losing sincerity or steadiness.\n\nWhy it works:\nThe manual describes metta as an emotion felt in the heart and bhavana as cultivation or development. Repetition through the five stages gradually broadens the emotional field so goodwill becomes less selective and more stable.",
  },
  "visualisation": {
    overview: "A guided inner narrative that moves from intentional thinking into embodied feeling.",
    details:
      "How to practice:\nUse a controlled narrative to guide awareness into a specific imagined place, idea, or perspective.\n- Set the pace and flow carefully.\n- Build the scene through details and considerations.\n- Move from who, what, when, where, and why toward a more embodied sense of where, when, what, and how it is being felt.\n- Let the imagined experience become sensory and lived rather than only conceptual.\n\nPurpose:\nUsed especially for students who are new to meditation or struggle to sit without gentle distraction. The emphasis is meaningful inner exploration that carries attention away from everything else.\n\nWhy it works:\nThe manual describes visualisation as a movement from intentional thinking to embodied feeling. A strong narrative holds the mind's curiosity while gradually shifting it from intellectual structuring into felt sensory experience.",
  },
  "ajapa-japa": {
    overview: "Quiet repetition of a mantra with continuous awareness.",
    details:
      "How to practice:\nChoose a mantra and repeat it quietly to yourself with dedicated attention.\n- Stay with the mantra continuously rather than only thinking about its material meaning.\n- For many practitioners, hold the mantra gently rather than trying to force a perfect no-thinking state.\n- A common form is repeating the mantra 108 times.\n- A mala bead can be used to keep track.\n- Keep attention on the full embodiment of the affirmation being offered.\n\nPurpose:\nUsed to stabilize awareness through continuous mantra repetition and deepen connection to the affirmation being offered. The emphasis is dedicated attention, continuity, and embodiment.\n\nWhy it works:\nThe manual explains ajapa-japa as japa without the same level of intellectual effort needed to relentlessly hold the mantra's material nature. Repetition keeps awareness steady, while the sustained mantra gradually shifts the practice from mental saying toward fuller embodied presence.",
  },
  "just-breathe-method": {
    overview:
      "A three-pillar approach to down-regulation, inwardness, and conscious unwinding.",
    details:
      "The manual presents the method through three connected pillars:\n- Breathwork\n- Meditation\n- Deep Rest\n\nEach pillar can be practised on its own, but their combined use is described as exponentially more valuable for conscious unwinding.\n\nBreathwork helps regulate the nervous system through the movement and manipulation of the breathing pattern. Meditation helps quiet the mind, reduce mental load, and return attention to ease and effortlessness. Deep rest creates a dedicated period of conscious unwinding in which the body is allowed to soften into recovery, healing, and rejuvenation.\n\nImportant to remember:\n- The method is intentionally organised around down-regulation.\n- The three pillars are distinct, but designed to work together.\n- The aim is practical support for everyday mind and mental health.",
  },
  "quiet-practices": {
    overview:
      "Down-regulated practices that support the wider conditions of well-being.",
    details:
      "In the manual, quiet practices are the category used for practices that down-regulate the nervous system, de-stress the body, and support response-driven behaviour.\n\nThey are not limited to one modality. Breathwork, meditation, deep rest, and other settling practices all belong here when they help reduce stimulation and guide the system toward ease.\n\nTheir purpose is broader than stress relief alone. Quiet practices are described as supporting five critical pillars of well-being:\n- Physical\n- Mental & Emotional\n- Social\n- Spiritual\n- Environmental\n\nImportant to remember:\n- Quiet practices are defined by their down-regulating effect.\n- They are meant to be everyday supports, not rare interventions.\n- Their value is measured by how they help a person soften, settle, and live better.",
  },
  "close-your-eyes-be-still-just-breathe": {
    overview:
      "The community invocation used to begin practice with simplicity and shared meaning.",
    details:
      "How to practice:\nLet the phrase set the entry into practice one instruction at a time.\n- Close the eyes or soften the gaze if that feels safer.\n- Let the body become more still.\n- Allow the breath to become the main point of attention.\n- Pause long enough for the transition into practice to be felt.\n\nPurpose:\nUsed to mark the shift from ordinary activity into deliberate practice. The emphasis is arrival, simplification, and inward attention.\n\nWhy it works:\nA clear opening cue reduces sensory spread and gives the nervous system a recognizable transition signal. Softening visual input, reducing movement, and turning toward the breath all support parasympathetic settling and stronger attentional coherence.",
  },
  "3-gratitudes": {
    overview:
      "A short reflective prompt that supports grounding, appreciation, and integration.",
    details:
      "Three gratitudes offer a simple way to soften attention, reconnect, and notice what is already supportive. The practice can help orient the mind toward steadiness, appreciation, and integration.",
  },
  "stress-and-rest-concepts": {
    overview: "Key models for understanding stress, overload, and conscious rest.",
    details:
      "This section gathers the main conceptual tools used to recognise stress, understand overload, and orient practice toward recovery.\n\nThe emphasis is on how stress builds, how it shows up, and what conditions support a real shift toward rest.\n\nImportant to remember:\n- The child cards hold the specific models and distinctions.\n- These concepts are meant to improve recognition and self-management.",
  },
  "notice-what-you-notice-feel-what-you-feel": {
    overview:
      "A permissive cue for presence, honesty, and direct experience without over-managing it.",
    details:
      "The phrase captures the tone of the method: notice directly, feel directly, and allow the moment to be what it is. Awareness takes priority over performance.",
  },
  "s-t-r-e-s-s": {
    overview:
      "Six common everyday triggers that create pressure and nervous-system reactivity.",
    details:
      "Stress is described in the manual as the body's response to pressure, especially when something new, unexpected, or hard to control threatens the sense of self.\n\nThe six letters point to six common everyday triggers:\n- Situational Occurrences: unplanned or disruptive moments that knock us off course\n- Time: pressure created when needed time and available time do not match\n- Responsibilities: real or perceived obligations to tasks, people, and circumstances\n- Emotions: personal reactions to events and stimulus, which differ from person to person\n- Societal Expectation: the load of other people's opinions, norms, and assumptions\n- Sleep: the quantity and quality of rest that determine how much pressure can be managed well\n\nImportant to remember:\n- Stress becomes more disruptive when it accumulates in the nervous system.\n- Managing stress begins with recognising what is actually creating it.",
  },
  "the-big-six": {
    overview:
      "A six-part model of common everyday stress triggers.",
    details:
      "The Big Six names the everyday triggers that often create pressure, overload, and nervous-system reactivity.\n\nThe six areas are:\n- Situational Occurrences\n- Time\n- Responsibilities\n- Emotions\n- Societal Expectation\n- Sleep\n\nImportant to remember:\n- The model is practical rather than abstract.\n- Its purpose is to make stress easier to recognise in daily life.",
  },
  "r-e-s-t": {
    overview:
      "A simple model for what real rest requires.",
    details:
      "Rest is described as a conscious state of healing and recovery. In the manual, REST is defined as the reduction of external stimulus over a prolonged period of time.\n\nThe four letters point to four key conditions:\n- Reduce: intentionally do less and reduce noise, distraction, and demand\n- External: reduce what is outside the self and constantly pulling attention outward\n- Stimulus: reduce sensory, social, cognitive, and emotional input that keeps the system activated\n- Time: allow enough time for unwinding, because a brief pause is not the same as meaningful rest\n\nImportant to remember:\n- Rest and sleep are related but not identical.\n- Rest requires deliberate reduction, not only the absence of activity.",
  },
  "stress-container": {
    overview:
      "A model for how stress accumulates, overflows, and is released.",
    details:
      "The stress container represents the level of vulnerability a person carries and the amount of everyday stress that can be held before overwhelm develops.\n\nA larger container suggests lower vulnerability and greater capacity. A smaller container overflows more quickly, especially when shaped by factors such as trauma, bullying, abuse, or chronic pressure.\n\nThe model also includes:\n- a tap, through which stress can be released\n- trapped stress below the tap, which may not be easy to discharge immediately\n- helpful coping strategies, which keep the tap working\n- unhelpful coping strategies, which block release and increase build-up\n\nImportant to remember:\n- Stress containers are never completely empty.\n- The goal is active management, not total elimination of stress.",
  },
  "stress-signature": {
    overview:
      "The personal pattern that appears when stress exceeds capacity.",
    details:
      "In the manual, stress signature is linked to the point at which the stress container overflows and overwhelm becomes visible.\n\nA stress signature is the recurring way overload shows up in a particular person. It may include breath changes, emotional reactivity, thought loops, behavioural changes, tension patterns, or other signs that stress is no longer being managed well.\n\nImportant to remember:\n- A stress signature is personal.\n- Recognising it early helps create capacity before overwhelm deepens.",
  },
  "stimulus-response-gap": {
    overview:
      "The space in which stimulation can be met with awareness instead of automatic reaction.",
    details:
      "The manual repeatedly frames modern life as highly stimulating. Noise, people, screens, sensations, thoughts, demands, and expectations all act as forms of stimulus that can push the nervous system toward dysregulation.\n\nThis gap matters because practice can interrupt automaticity. When awareness is stronger, a person is less likely to be driven immediately by pressure, emotion, or overload and more able to choose a steadier response.\n\nQuiet practices support this by reducing external stimulation, strengthening self-observation, and giving the body and mind moments of non-doing.\n\nImportant to remember:\n- Not every stimulus needs an immediate reaction.\n- The gap becomes more available when the system is less overloaded.\n- Awareness is what turns a triggered moment into a workable one.",
  },
  "5-pillars-of-well-being": {
    overview:
      "Five areas of life that quiet practices are meant to support.",
    details:
      "Quiet practices are presented in the manual as support for five critical pillars of well-being:\n- Physical\n- Mental & Emotional\n- Social\n- Spiritual\n- Environmental\n\nThe model broadens the purpose of practice beyond stress relief alone. Breathwork, meditation, deep rest, and shared practice are meant to support the wider conditions that shape human well-being.\n\nImportant to remember:\n- Well-being is multi-dimensional.\n- Practice is strongest when it supports daily life as a whole, not only isolated moments of calm.",
  },
  "3-depths-of-practice": {
    overview:
      "The meditation framework that organizes practices into three distinct depths.",
    details:
      "The three depths of practice are established in being, present moment awareness, and focused intention. Together they organize meditation techniques by how they relate to the mind and where attention is placed.",
  },
  "6-phases-of-non-doing": {
    overview:
      "A staged way of understanding how settling into non-doing may unfold in practice.",
    details:
      "Non-doing can unfold through recognizable phases as effort softens and awareness settles. The phases help describe how being, witness state, and stillness may deepen over time.",
  },
  "from-stress-to-rest": {
    overview: "Foundational context for the course's movement from activation toward ease.",
    details:
      "This section gathers the core orientation, language, and practice invitations that frame the whole curriculum. It holds the conceptual starting point for how Just Breathe understands stress, rest, quiet practice, and the move toward regulation.",
  },
  "opening-invitation": {
    overview: "The short ritual invitation that marks the beginning of practice.",
    details:
      "The opening invitation gathers attention into the moment and signals a transition from outer stimulation toward inward practice. It gives the curriculum a clear shared threshold into stillness, breath, and presence.",
  },
  "integration-teaching-methods": {
    overview: "Session design, preparatory supports, and full practice formats.",
    details:
      "This section holds the structural side of the curriculum: how sessions are shaped, how participants are prepared and supported, and how full formats are assembled into coherent guided experiences.",
  },
  "principles-of-guidance": {
    overview: "Guiding principles and reference structures for teaching the practices well.",
    details:
      "This section gathers guidance-oriented material and secondary reference structures that support recall, teaching, and navigation across the wider curriculum.",
  },
  "session-structure": {
    overview: "The opening and closing architecture of a guided session.",
    details:
      "Opening and closing are not incidental transitions but meaningful structural elements. Together they shape how a practice begins, how it lands, and how participants are moved into and out of the session.",
  },
  "session-frameworks": {
    overview: "The main high-level frameworks used for breathwork and meditation sessions.",
    details:
      "Different session types share common principles while keeping modality-specific pacing and emphasis. These frameworks group the main structures used when guiding breathwork and meditation.",
  },
  "deep-rest-principles": {
    overview: "Foundational principles for conscious unwinding and deep rest.",
    details:
      "This section gathers the core ideas that frame deep rest as a deliberate practice of settling, unwinding, and recovery rather than passive inactivity alone.",
  },
  "deep-rest-practices": {
    overview: "The main practices and states used to enter and sustain deep rest.",
    details:
      "This section groups the practical elements of deep rest, including supported positioning, stillness, and integration after practice.",
  },
  "guiding-principles": {
    overview: "Core principles for how the practices are guided and shared.",
    details:
      "This section gathers the main guidance-oriented ideas that shape tone, language, pacing, structure, and participant support in the teaching process.",
  },
  "guidance-concepts": {
    overview:
      "Principles for creating practices that are careful, purposeful, and genuinely supportive.",
    details:
      "The guidance material in the manual is not only about delivery style. It is about creating an experience with consent, consideration, care, and clear intention.\n\nSeveral themes shape this approach:\n- Awareness: guidance begins with witness, self-observation, and attention to what is actually happening\n- Education: a guide is expected to keep learning, refine technique, and understand what is being offered\n- Experience: the aim is to create a valuable and meaningful moment, not just to perform instructions\n- Consent and consideration: participants need agency, context, and an offering suited to their actual state\n- Ask, assess, respond: guidance should adapt to the person, group, environment, and need state in front of you\n- Intention, technique, sequence, practice, observation: these are named as the main steps in building and refining an offering\n\nThe meditation guidance material also adds structural language tools such as Words to Live By, Bookends, Guiding Light, Light Housing, and Bread Crumbs. Together they show that good guidance is designed, practised, and observed rather than improvised carelessly.\n\nImportant to remember:\n- Knowing what to share is different from knowing how to share it.\n- A practice should be effective, not merely well planned.\n- Guidance is strongest when it is personal, adaptable, and grounded in lived practice.",
  },
  "reference-views": {
    overview: "Secondary reference structures for study, recall, and teaching support.",
    details:
      "This section holds alternative entry points into the curriculum that are useful for cross-reference, recall, and guidance preparation rather than primary course navigation.",
  },
};

const relatedOverrides = {
  "session-architecture": [
    "universal-practice-framework",
    "opening-sequence",
    "closing-sequence",
    "breathwork-session-framework",
    "meditation-session-framework",
  ],
  "opening-sequence": [
    "close-your-eyes-be-still-just-breathe",
    "universal-practice-framework",
    "practice-setup",
    "closing-sequence",
  ],
  "closing-sequence": ["integration", "3-gratitudes", "opening-sequence", "stillness"],
  breathwork: [
    "breathwork-foundations",
    "breath-concepts",
    "breathwork-techniques",
    "breathwork-protocols",
    "deep-rest",
  ],
  "functional-breath-awareness": [
    "systematic-breathwork",
    "anatomy-of-the-breath",
    "breath-awareness",
    "conscious-breath",
  ],
  "systematic-breathwork": [
    "functional-breath-awareness",
    "nervous-system-regulation",
    "breathwork-protocols",
    "nsrt-method",
  ],
  "nervous-system-recognition": [
    "nervous-system-regulation",
    "stress-signature",
    "stress-container",
    "direct-response-gradual-response",
  ],
  "nervous-system-regulation": [
    "nervous-system-recognition",
    "nervous-system-release",
    "down-regulation-up-regulation",
    "nsrt-method",
    "recovery-breath",
  ],
  "nervous-system-release": [
    "nervous-system-regulation",
    "deep-rest",
    "integration",
    "full-unwinding",
  ],
  "physiological-sigh": [
    "extended-exhale",
    "recovery-breath",
    "triangle-breathing",
    "down-regulation-techniques",
  ],
  "extended-exhale": [
    "physiological-sigh",
    "triangle-breathing",
    "3-part-breathing",
    "grounding-expanding-the-exhale",
  ],
  "coherent-breath": [
    "365-method",
    "even-breath",
    "box-breathing",
    "balanced-nsrt-protocols",
  ],
  "box-breathing": [
    "coherent-breath",
    "inspired-pause",
    "alternate-nostril-breathing",
    "balanced-nsrt-protocols",
  ],
  "down-regulation-techniques": [
    "up-regulation-techniques",
    "down-regulation-up-regulation",
    "down-regulation-protocols",
    "deep-rest",
  ],
  "up-regulation-techniques": [
    "down-regulation-techniques",
    "up-regulation-protocols",
    "energising-breath",
    "breath-of-joy",
  ],
  "down-regulation-protocols": [
    "down-regulation-techniques",
    "pxc",
    "xlt",
    "restorative-nsrt-protocols",
  ],
  "up-regulation-protocols": [
    "up-regulation-techniques",
    "e3j",
    "3cc",
    "balanced-nsrt-protocols",
  ],
  "nsrt-method": [
    "balanced-nsrt-protocols",
    "down-regulation-protocols",
    "up-regulation-protocols",
    "restorative-nsrt-protocols",
    "nervous-system-regulation",
  ],
  meditation: [
    "meditation-foundations",
    "meditation-techniques-3-depths-of-practice",
    "meditation-concepts",
    "deep-rest",
    "concept-meditation-concepts",
  ],
  "the-thinking-mind": [
    "witness-state",
    "awareness",
    "attention",
    "3-depths-of-practice",
  ],
  "witness-state": [
    "the-thinking-mind",
    "open-monitoring",
    "present-moment-awareness",
    "being-technique",
  ],
  "being-technique": [
    "just-breathe-meditation",
    "stillness-non-doing-practice",
    "established-in-being",
    "witness-state",
  ],
  "present-moment-awareness": [
    "watching-the-breath",
    "breath-awareness",
    "open-monitoring",
    "witness-state",
  ],
  "focused-intention": [
    "guided-meditation-intention-led-meditation",
    "visualisation",
    "mantras",
    "affirmations",
  ],
  "6-phases-of-non-doing": [
    "non-doing",
    "stillness",
    "being-technique",
    "established-in-being",
  ],
  "deep-rest": [
    "conscious-unwinding",
    "resting-position-supported-practice",
    "stillness",
    "integration",
    "full-unwinding",
  ],
  stillness: ["non-doing", "deep-rest", "integration", "being-technique", "6-phases-of-non-doing"],
  integration: ["deep-rest", "closing-sequence", "3-gratitudes", "stillness"],
  "nervous-system-reset": [
    "direct-response-tools",
    "awareness-exercises",
    "practice-setup",
    "nervous-system-regulation",
  ],
  "practice-setup": ["opening-sequence", "movement-preparation", "nervous-system-reset"],
  "full-unwinding": ["exhale", "deep-rest", "integration", "breathwork-meditation-deep-rest"],
  "just-breathe-method": [
    "quiet-practices",
    "time-well-spent",
    "close-your-eyes-be-still-just-breathe",
    "being-technique",
  ],
  "quiet-practices": [
    "just-breathe-method",
    "deep-rest",
    "meditation",
    "breathwork",
  ],
  "notice-what-you-notice-feel-what-you-feel": [
    "awareness",
    "witness-state",
    "just-breathe-method",
    "stimulus-response-gap",
  ],
  "stimulus-response-gap": [
    "s-t-r-e-s-s",
    "r-e-s-t",
    "nervous-system-recognition",
    "notice-what-you-notice-feel-what-you-feel",
  ],
  "3-depths-of-practice": [
    "established-in-being",
    "present-moment-awareness",
    "focused-intention",
    "meditation",
  ],
};

function slugify(input) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/°/g, "")
    .replace(/→/g, " ")
    .replace(/[’']/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .toLowerCase();
}

function pathKey(pathParts) {
  return pathParts.join(" > ");
}

function getCardId(pathParts, title) {
  const fullPath = pathKey([...pathParts, title]);
  if (idOverrides[fullPath]) {
    return idOverrides[fullPath];
  }
  if (idOverrides[title]) {
    return idOverrides[title];
  }
  if (mergeByTitle[title]) {
    return mergeByTitle[title];
  }
  return slugify(title);
}

function getRootTitle(pathParts, title) {
  return pathParts[0] || title;
}

function inferType(title, hasChildren, pathParts) {
  const lineage = [...pathParts, title].join(" ");
  if (hasChildren) {
    return "is_category";
  }
  if (forcedConceptTitles.has(title)) {
    return "is_concept";
  }
  if (/method|protocol/i.test(title)) {
    return "is_method";
  }
  if (/framework|architecture|foundations|concepts|mind|awareness|attention|intention|state|axis|pillar|container|signature|gap|being|stillness/i.test(title)) {
    return "is_concept";
  }
  if (/sequence|format|combination/i.test(lineage)) {
    return "is_sequence";
  }
  if (/practice|meditation|breathing|breath|breathwork|sigh|inhale|exhale|humming|nostril|box|scan|gaze|visualisation|affirmations|metta|japa|trataka|mantra/i.test(title)) {
    return "is_technique";
  }
  return "is_concept";
}

function buildTags(title, hasChildren, pathParts) {
  const rootTitle = getRootTitle(pathParts, title);
  const root = rootConfig[rootTitle];
  const typeTag = inferType(title, hasChildren, pathParts);
  const tags = [typeTag, root.discipline, root.icon, root.color];

  const lineage = [...pathParts, title].join(" > ");
  if (/Concept Cards|Concepts/.test(lineage)) {
    tags.push("is_reference");
  }
  if (/Meditation/.test(lineage)) {
    tags.push("discipline_meditation");
  }
  if (/Breathwork|NSRT|Breath /.test(lineage)) {
    tags.push("discipline_breathwork");
  }
  if (/Deep Rest|Stillness|Integration/.test(lineage)) {
    tags.push("discipline_deep_rest");
  }

  return [...new Set(tags)];
}

function uniquePush(list, value) {
  if (value && !list.includes(value)) {
    list.push(value);
  }
}

function joinTitles(ids, cards, max = 4) {
  return ids
    .slice(0, max)
    .map((id) => cards[id]?.title)
    .filter(Boolean)
    .join(", ");
}

function toSentenceCase(text) {
  if (!text) {
    return text;
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function humanList(items) {
  if (items.length === 0) {
    return "";
  }
  if (items.length === 1) {
    return items[0];
  }
  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function titleToLowerPhrase(title) {
  return title
    .replace(/[()]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function hasTag(card, prefix) {
  return card.tags.some((tag) => tag === prefix);
}

function includesAny(text, patterns) {
  return patterns.some((pattern) => text.includes(pattern));
}

function inferTechniqueMode(card) {
  const lower = titleToLowerPhrase(card.title);

  if (includesAny(lower, ["body scan", "trataka", "watching the breath", "just breathe meditation"])) {
    return "meditation_awareness";
  }
  if (includesAny(lower, ["loving kindness", "metta", "ajapa", "mantra", "visualisation", "affirmations"])) {
    return "meditation_intention";
  }
  if (includesAny(lower, ["physiological sigh", "extended exhale", "triangle", "pinhole", "humming", "cooling", "recovery breath", "exhale", "coherent breath"])) {
    return "breath_calming";
  }
  if (includesAny(lower, ["energising", "cleansing", "bellows", "lion", "interrupted inhale", "warming", "inhale", "elephant", "breath of joy", "horse stance"])) {
    return "breath_energising";
  }
  if (includesAny(lower, ["alternate nostril", "box breathing", "even breath", "3-part inhale / exhale", "3-part inhale exhale"])) {
    return "breath_balancing";
  }
  if (includesAny(lower, ["diaphragmatic", "costal", "clavicular", "360 breathing", "conscious breath", "functional breath awareness"])) {
    return "breath_mechanics";
  }
  if (includesAny(lower, ["breath awareness"])) {
    return "meditation_awareness";
  }
  if (hasTag(card, "discipline_meditation")) {
    return "meditation_generic";
  }
  return "breath_generic";
}

function buildTechniqueSections(card) {
  const mode = inferTechniqueMode(card);

  if (mode === "breath_calming") {
    return {
      howTo:
        "Start in a steady posture and let the breath become deliberate rather than automatic.\n- Slow the rhythm down.\n- Give more time or emphasis to the exhale than to the inhale.\n- Keep the face, jaw, and shoulders as soft as possible.\n- Continue for several rounds until the breath and overall tone begin to settle.",
      purpose:
        "Used to reduce activation, create a stronger sense of safety, and help the system shift toward steadiness. The main emphasis is down-regulation rather than intensity.",
      whyItWorks:
        "A longer or softer exhale tends to increase parasympathetic influence through vagal pathways and reduces the urgency of the breathing pattern. Slower breathing can also improve carbon dioxide tolerance, reduce unnecessary chest tension, and signal to the nervous system that immediate mobilization is no longer needed.",
    };
  }

  if (mode === "breath_energising") {
    return {
      howTo:
        "Begin in an upright posture with enough space for the ribcage and abdomen to move.\n- Make the inhale more active, sharper, or more expansive.\n- Let the exhale either release naturally or support the rhythm without collapsing posture.\n- Use a clear cadence for a short set of rounds.\n- Pause afterward and notice whether the body feels more awake, warm, and available.",
      purpose:
        "Used to increase alertness, raise energy, and mobilize attention when more activation is useful. The main emphasis is uplift, readiness, and momentum rather than calming.",
      whyItWorks:
        "More active inhalation and stronger respiratory movement increase arousal and can raise heart rate, thoracic expansion, and sensory alertness. The pattern recruits respiratory muscles more strongly, changes blood gases more quickly, and tends to shift the nervous system toward sympathetic activation and readiness.",
    };
  }

  if (mode === "breath_balancing") {
    return {
      howTo:
        "Settle into an even posture and choose a rhythm that feels sustainable.\n- Keep inhale and exhale measured and intentional.\n- Add pauses or nostril changes only as the technique requires.\n- Maintain smooth transitions rather than forcing the breath.\n- Continue until the rhythm becomes stable and easy to follow.",
      purpose:
        "Used to create steadiness, balance, and clearer regulation when the system does not need a strong push in either direction. The emphasis is evenness, pacing, and coherence.",
      whyItWorks:
        "Regular rhythm stabilizes respiratory drive and gives the nervous system a predictable pattern to follow. Balanced breathing can reduce reactivity, improve attentional control, and support autonomic regulation by smoothing fluctuations in breath depth, timing, and muscular effort.",
    };
  }

  if (mode === "breath_mechanics") {
    return {
      howTo:
        "Bring attention to where the breath is moving in the body and shape it deliberately.\n- Notice whether movement is happening more in the belly, ribs, chest, or upper chest.\n- Guide the breath toward the area the technique emphasizes.\n- Keep unnecessary effort low so sensation stays clear.\n- Repeat slowly enough to feel the pattern rather than only think about it.",
      purpose:
        "Used to improve awareness of breathing mechanics, expand control over where the breath moves, and make later regulation techniques more precise. The emphasis is skill, sensation, and functional breathing quality.",
      whyItWorks:
        "Breathing mechanics affect diaphragm use, rib movement, posture, and the amount of muscular effort needed for each breath. Clearer mechanical awareness improves interoception, helps reduce compensatory tension, and creates a better foundation for both calming and energising practices.",
    };
  }

  if (mode === "meditation_awareness") {
    return {
      howTo:
        "Choose a stable posture and let the body become relatively still.\n- Place attention on the chosen object, such as the breath, the body, or a visual point.\n- When the mind wanders, notice it and return without force.\n- Stay with direct experience rather than trying to perform well.\n- Continue long enough for attention to settle and perception to become clearer.",
      purpose:
        "Used to strengthen attention, increase present-moment awareness, and reduce entanglement with constant mental activity. The emphasis is observation, steadiness, and clearer contact with experience.",
      whyItWorks:
        "Repeatedly returning attention trains attentional control and metacognitive awareness. Interoceptive and sensory focus can reduce mental scattering, while steadier observation changes how strongly thoughts, impulses, and external stimuli capture the nervous system.",
    };
  }

  if (mode === "meditation_intention") {
    return {
      howTo:
        "Sit in a steady posture and choose the phrase, image, or inner direction the practice uses.\n- Repeat, visualize, or evoke it gently and consistently.\n- Let attention return to that chosen point whenever distraction appears.\n- Keep effort present but not rigid.\n- Stay with the practice long enough for the intention to become felt rather than merely verbal.",
      purpose:
        "Used to shape the tone of the mind through a chosen inner object such as a mantra, image, phrase, or emotional orientation. The emphasis is direction, conditioning, and deliberate mental framing.",
      whyItWorks:
        "Focused repetition recruits attention, memory, and emotional salience at the same time. A stable inner object reduces fragmentation, while repeated exposure can gradually influence expectation, affective tone, and the nervous system's habitual response patterns.",
    };
  }

  if (mode === "meditation_generic") {
    return {
      howTo:
        "Begin with a posture that is stable but not rigid.\n- Choose the main instruction and stay close to it.\n- Notice distraction without turning it into a problem.\n- Return again and again to the intended point of practice.\n- End by pausing long enough to notice the overall effect.",
      purpose:
        "Used to steady attention, deepen awareness, and create a more workable relationship with mental activity. The emphasis depends on the technique, but usually includes clarity, settling, and reduced reactivity.",
      whyItWorks:
        "Meditation changes how attention is deployed and how strongly thoughts or stimuli trigger automatic reactions. Repetition builds familiarity with observing rather than immediately identifying with experience, which can alter both cognitive and autonomic patterns over time.",
    };
  }

  return {
    howTo:
      "Begin in a clear posture and follow the core instruction of the technique with steady pacing.\n- Keep the form simple enough to stay aware of what is happening.\n- Adjust effort so the practice remains sustainable.\n- Continue for several rounds or minutes.\n- Pause afterward and notice the effect before moving on.",
    purpose:
      "Used to create a specific shift in breathing, attention, or nervous-system state. The emphasis depends on the technique, but usually involves regulation, awareness, or directed mental focus.",
    whyItWorks:
      "Breathing patterns and attentional patterns both influence autonomic state, muscular tone, and perception. Repetition makes the effect more reliable by linking deliberate practice with physiological and neurophysiological change.",
  };
}

function inferOverviewPhrase(card) {
  const lower = titleToLowerPhrase(card.title);

  if (lower.includes("architecture")) {
    return "A framework for understanding how the breath is structured.";
  }
  if (lower.includes("anatomy")) {
    return "A basic map of the structures involved in breathing.";
  }
  if (lower.includes("respiratory system")) {
    return "An overview of how breathing is supported in the body.";
  }
  if (lower.includes("nervous system")) {
    return "An overview of the system that shapes activation, regulation, and recovery.";
  }
  if (lower.includes("awareness")) {
    return "A practice of noticing more clearly before trying to change anything.";
  }
  if (lower.includes("attention")) {
    return "A way of placing focus deliberately and steadily.";
  }
  if (lower.includes("intention")) {
    return "A way of giving practice direction and purpose.";
  }
  if (lower.includes("state")) {
    return "A way of noticing experience without being fully carried by it.";
  }
  if (lower.includes("method") || lower.includes("protocol")) {
    return "A structured approach for guiding practice in a repeatable way.";
  }
  if (lower.includes("sequence") || lower.includes("combination") || lower.includes("format")) {
    return "A longer arc built from multiple practice elements.";
  }
  if (lower.includes("breathing") || lower.includes("breath") || lower.includes("meditation")) {
    return "A practice used to shape breathing, attention, or state.";
  }

  if (card.tags.includes("is_method")) {
    return "A structured approach for guiding practice in a repeatable way.";
  }
  if (card.tags.includes("is_sequence")) {
    return "A longer arc built from multiple practice elements.";
  }
  if (card.tags.includes("is_technique")) {
    return "A practice used to shape breathing, attention, or state.";
  }
  return "A concept used to organize understanding and guidance.";
}

function generateOverview(card, cards) {
  if (forcedEmptyContentIds.has(card.id)) {
    return "";
  }

  if (contentOverrides[card.id]?.overview) {
    return contentOverrides[card.id].overview;
  }

  if (card.children.length > 0) {
    return "";
  }

  return inferOverviewPhrase(card);
}

function generateDetails(card, cards) {
  if (forcedEmptyContentIds.has(card.id)) {
    return "";
  }

  if (contentOverrides[card.id]?.details) {
    return contentOverrides[card.id].details;
  }

  if (card.children.length > 0) {
    return "";
  }

  if (card.tags.includes("is_method")) {
    return `A reusable structure gives practice a clear shape instead of relying on improvisation alone.\n\nTypical points of focus:\n- purpose and intended effect\n- pacing and sequencing\n- when to use it\n- how related variants fit around it\n\nImportant to remember:\n- The structure matters as much as the individual elements inside it.`;
  }

  if (card.tags.includes("is_sequence")) {
    return `Multiple elements are arranged here as a longer practice arc rather than a single isolated step.\n\nWhy the sequence matters:\n- the opening sets the tone\n- the middle shapes the main experience\n- the ending helps the practice land well\n\nImportant to remember:\n- Order changes the effect of the whole experience.`;
  }

  if (card.tags.includes("is_technique")) {
    const sections = buildTechniqueSections(card);
    return `How to practice:\n${sections.howTo}\n\nPurpose:\n${sections.purpose}\n\nWhy it works:\n${sections.whyItWorks}`;
  }

  return `Clear concepts make practice easier to understand, compare, and teach.\n\nWhy it matters:\n- language becomes more precise\n- distinctions become easier to hold\n- related practices make more sense in context\n\nKey points:\n- Concepts are most useful when they stay connected to lived practice.`;
}

const cards = {};

function ensureCard(id, title, pathParts, hasChildren) {
  const rootTitle = getRootTitle(pathParts, title);
  if (!cards[id]) {
    cards[id] = {
      id,
      title,
      overview: "",
      details: "",
      tags: buildTags(title, hasChildren, pathParts),
      parents: [],
      children: [],
      related: [],
    };
  } else if (hasChildren) {
    for (const tag of buildTags(title, hasChildren, pathParts)) {
      uniquePush(cards[id].tags, tag);
    }
  }

  if (!cards[id].tags.some((tag) => tag.startsWith("icon_"))) {
    uniquePush(cards[id].tags, rootConfig[rootTitle].icon);
  }
  if (!cards[id].tags.some((tag) => tag.startsWith("color_"))) {
    uniquePush(cards[id].tags, rootConfig[rootTitle].color);
  }

  return cards[id];
}

function walk(nodes, pathParts = [], parentId = null) {
  for (const node of nodes) {
    const id = getCardId(pathParts, node.title);
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const card = ensureCard(id, node.title, pathParts, hasChildren);

    uniquePush(card.parents, parentId);

    if (hasChildren) {
      const childIds = node.children.map((child) => getCardId([...pathParts, node.title], child.title));
      for (const childId of childIds) {
        uniquePush(card.children, childId);
      }
      walk(node.children, [...pathParts, node.title], id);
    }
  }
}

walk(outline);

function ensureSyntheticCard(id, title, color, icon, discipline = "discipline_integrated") {
  if (!cards[id]) {
    cards[id] = {
      id,
      title,
      overview: "",
      details: "",
      tags: ["is_category", discipline, icon, color],
      parents: [],
      children: [],
      related: [],
    };
  }

  for (const tag of ["is_category", discipline, icon, color]) {
    uniquePush(cards[id].tags, tag);
  }

  return cards[id];
}

function setChildren(parentId, childIds) {
  cards[parentId].children = childIds.filter((id) => cards[id]);
}

function setPrimaryParent(childId, parentId) {
  if (!cards[childId] || !cards[parentId]) {
    return;
  }
  cards[childId].parents = [parentId, ...cards[childId].parents.filter((id) => id !== parentId)];
}

function removeParent(childId, parentId) {
  if (!cards[childId]) {
    return;
  }
  cards[childId].parents = cards[childId].parents.filter((id) => id !== parentId);
}

ensureSyntheticCard("from-stress-to-rest", "From Stress to Rest", "color_sand", "icon_sunrise");
ensureSyntheticCard(
  "opening-invitation",
  "Opening Invitation",
  "color_sand",
  "icon_sparkles",
);
ensureSyntheticCard(
  "integration-teaching-methods",
  "Integration & Teaching Methods",
  "color_rose",
  "icon_layers_3",
);
ensureSyntheticCard(
  "principles-of-guidance",
  "Principles of Guidance",
  "color_slate",
  "icon_book_open",
);
ensureSyntheticCard("session-structure", "Session Structure", "color_sand", "icon_git_branch");
ensureSyntheticCard("session-frameworks", "Session Frameworks", "color_sand", "icon_panels_top_left");
ensureSyntheticCard("deep-rest-principles", "Deep Rest Principles", "color_emerald", "icon_bed_double");
ensureSyntheticCard("deep-rest-practices", "Deep Rest Practices", "color_emerald", "icon_moon");
ensureSyntheticCard("guiding-principles", "Guiding Principles", "color_slate", "icon_book_open");
ensureSyntheticCard("reference-views", "Reference Views", "color_slate", "icon_network");

setChildren("from-stress-to-rest", [
  "core-practice-concepts",
  "opening-invitation",
  "stress-and-rest-concepts",
]);

setChildren("opening-invitation", [
  "close-your-eyes-be-still-just-breathe",
  "notice-what-you-notice-feel-what-you-feel",
]);

setChildren("breathwork", [
  "breathwork-foundations",
  "breath-concepts",
  "breathwork-techniques",
  "breathwork-protocols",
]);

setChildren("integration-teaching-methods", [
  "session-architecture",
  "preparatory-support-practices",
  "full-practice-formats",
]);

setChildren("deep-rest", ["deep-rest-principles", "deep-rest-practices"]);

setChildren("deep-rest-principles", [
  "deep-rest-foundations",
  "conscious-unwinding",
]);

setChildren("deep-rest-practices", [
  "resting-position-supported-practice",
  "stillness",
  "integration",
]);

setChildren("session-architecture", [
  "universal-practice-framework",
  "session-structure",
  "session-frameworks",
  "integration-recovery-stillness",
]);

setChildren("session-structure", ["opening-sequence", "closing-sequence"]);
setChildren("session-frameworks", [
  "breathwork-session-framework",
  "meditation-session-framework",
]);

setChildren("principles-of-guidance", ["guiding-principles", "reference-views"]);
setChildren("guiding-principles", ["guidance-concepts"]);
setChildren("reference-views", ["concept-cards"]);

setPrimaryParent("core-practice-concepts", "from-stress-to-rest");
setPrimaryParent("stress-and-rest-concepts", "from-stress-to-rest");
setPrimaryParent("opening-invitation", "from-stress-to-rest");

for (const id of ["just-breathe-method", "quiet-practices", "time-well-spent", "3-gratitudes"]) {
  setPrimaryParent(id, "core-practice-concepts");
}

for (const id of [
  "close-your-eyes-be-still-just-breathe",
  "notice-what-you-notice-feel-what-you-feel",
]) {
  setPrimaryParent(id, "opening-invitation");
}

setPrimaryParent("opening-invitation", "from-stress-to-rest");
setPrimaryParent("breathwork-protocols", "breathwork");
setPrimaryParent("session-architecture", "integration-teaching-methods");
setPrimaryParent("preparatory-support-practices", "integration-teaching-methods");
setPrimaryParent("full-practice-formats", "integration-teaching-methods");
setPrimaryParent("guiding-principles", "principles-of-guidance");
setPrimaryParent("reference-views", "principles-of-guidance");
setPrimaryParent("guidance-concepts", "guiding-principles");
setPrimaryParent("concept-cards", "reference-views");
setPrimaryParent("session-structure", "session-architecture");
setPrimaryParent("session-frameworks", "session-architecture");
setPrimaryParent("opening-sequence", "session-structure");
setPrimaryParent("closing-sequence", "session-structure");
setPrimaryParent("breathwork-session-framework", "session-frameworks");
setPrimaryParent("meditation-session-framework", "session-frameworks");
setPrimaryParent("deep-rest-principles", "deep-rest");
setPrimaryParent("deep-rest-practices", "deep-rest");
setPrimaryParent("deep-rest-foundations", "deep-rest-principles");
setPrimaryParent("conscious-unwinding", "deep-rest-principles");
setPrimaryParent("resting-position-supported-practice", "deep-rest-practices");
setPrimaryParent("stillness", "deep-rest-practices");
setPrimaryParent("integration", "deep-rest-practices");

for (const id of [
  "breathwork-protocols",
  "session-architecture",
  "preparatory-support-practices",
  "full-practice-formats",
  "concept-cards",
  "core-practice-concepts",
  "stress-and-rest-concepts",
  "deep-rest-principles",
  "deep-rest-practices",
  "guiding-principles",
  "reference-views",
]) {
  removeParent(id, null);
}

for (const id of [
  "breathwork",
  "meditation",
  "deep-rest",
  "from-stress-to-rest",
  "integration-teaching-methods",
  "principles-of-guidance",
]) {
  cards[id].parents = [];
}

for (const card of Object.values(cards)) {
  card.overview = generateOverview(card, cards);
  card.details = generateDetails(card, cards);
}

for (const [id, relatedIds] of Object.entries(relatedOverrides)) {
  if (!cards[id]) {
    continue;
  }
  cards[id].related = relatedIds.filter((relatedId) => cards[relatedId]).slice(0, 5);
}

for (const card of Object.values(cards)) {
  if (!card.related.length) {
    card.related = [];
  }
}

const rootIds = [
  "from-stress-to-rest",
  "breathwork",
  "meditation",
  "deep-rest",
  "integration-teaching-methods",
  "principles-of-guidance",
];

const base = {
  rootIds,
  cards,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(base, null, 2)}\n`);

console.log(`Wrote ${outputPath}`);
console.log(`Cards: ${Object.keys(cards).length}`);
