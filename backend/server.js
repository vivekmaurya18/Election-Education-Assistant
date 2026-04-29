import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const keyIsValid = GEMINI_KEY.startsWith('AIza') && GEMINI_KEY.length > 20;

if (!keyIsValid) {
    console.warn('⚠️  WARNING: GEMINI_API_KEY is missing or invalid.');
    console.warn('   Valid keys start with "AIza...". Get one free at https://aistudio.google.com/app/apikey');
    console.warn('   Chatbot will use keyword-based fallback responses until a valid key is set.\n');
} else {
    console.log('✅ Gemini API key detected. AI responses are enabled.');
}

// Initialize Gemini only when key looks valid
const genAI = keyIsValid ? new GoogleGenerativeAI(GEMINI_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: `You are 'NirvachanMitra', a friendly and expert assistant on the Indian Election Process. 
Your goal is to educate users about voter registration, the voting process, EVMs, VVPAT, the Model Code of Conduct, election stages, and the roles of the Election Commission of India (ECI).
Keep your answers concise (under 200 words), helpful, and professional.
Use a warm, friendly tone and occasionally use simple Hindi phrases where appropriate (e.g., 'Namaste', 'Aapka swagat hai', 'Bahut accha sawaal hai!').
Always prioritize official ECI guidelines.
If a question is completely unrelated to Indian elections, politely redirect the user back to election topics.
Format your answers with bullet points or numbered lists when listing steps or multiple items — this improves readability.`,
}) : null;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.static('.'));

// -----------------------------------------------------------------------
// FIX 2: Expanded keyword-based fallback responses (used when Gemini fails)
// -----------------------------------------------------------------------
const chatbotResponses = {
    'registration': `Voter registration is simple! 📝
- Citizens 18+ can apply online at the Voters' Service Portal (voters.eci.gov.in).
- You need identity proof and address proof.
- Once verified, you get your EPIC card (Voter ID).
- You can also apply via the Voter Helpline App or at your local BLO office.
- Aap ghar baithe mobile se bhi kar sakte hain!`,

    'voting': `Voting day experience simplified: 🗳️
- Carry your Voter ID (or any of 12 approved photo IDs) to your assigned polling booth.
- The polling officer verifies your name in the electoral roll and marks your finger.
- Enter the voting compartment and press the candidate button on the EVM.
- The VVPAT screen shows a 7-second paper slip to confirm your choice.
- Vote dena aapka sabse bada adhikaar aur kartavya hai!`,

    'evm': `EVMs (Electronic Voting Machines) are highly secure! 📟
- Standalone machines — NOT connected to any internet or network.
- VVPAT lets you see a printed slip of exactly who you voted for.
- Manufactured only by BEL and ECIL under ECI supervision.
- Undergo mock polls and rigorous testing before every election.
- Bahut secure aur tamper-proof system hai.`,

    'mcc': `Model Code of Conduct (MCC) explained: ⚖️
- Comes into force from the date of election schedule announcement.
- No new government schemes can be announced after MCC kicks in.
- No religious or communal appeals allowed for votes.
- Parties and candidates must follow conduct rules strictly.
- Sab parties ko discipline mein rehna padta hai.`,

    'eci': `The Election Commission of India (ECI): 🏛️
- An autonomous constitutional body established in 1950.
- Headed by the Chief Election Commissioner (CEC).
- Supervises free and fair elections to Parliament, State Assemblies, and offices of President & VP.
- Has the power to disqualify candidates and recognize/de-recognize political parties.
- Voter Helpline: 1950`,

    'stages': `India's General Election Stages: 📋
1. Announcement of election schedule by ECI.
2. Model Code of Conduct comes into force.
3. Nomination of candidates.
4. Scrutiny and withdrawal of nominations.
5. Election campaign period.
6. Silence period (48 hours before polling).
7. Polling day (may be multi-phase).
8. Counting of votes.
9. Declaration of results.`,

    'default': `Namaste! 🙏 I'm NirvachanMitra, your Indian Elections guide.
I can help you with:
- 🗂️ Voter Registration
- 🗳️ Voting Process & Polling Day
- 📟 EVM & VVPAT Safety
- ⚖️ Model Code of Conduct
- 🏛️ Election Commission of India
- 📋 Election Stages
Ask me anything about these topics!`
};

function getKeywordResponse(text) {
    const t = text.toLowerCase();

    if (t.match(/registr|voter id|epic card|enrol|पंजीकरण|रजिस्ट्रेशन|मतदाता पहचान/)) {
        return chatbotResponses['registration'];
    }
    if (t.match(/voting|polling day|vote|booth|मतदान|वोट|मतदान केंद्र/)) {
        return chatbotResponses['voting'];
    }
    if (t.match(/\bevm\b|vvpat|electronic voting|machine|ईवीएम|मशीन/)) {
        return chatbotResponses['evm'];
    }
    if (t.match(/model code|mcc|conduct|rules|आचार संहिता/)) {
        return chatbotResponses['mcc'];
    }
    if (t.match(/eci|election commission|commission|चुनाव आयोग/)) {
        return chatbotResponses['eci'];
    }
    if (t.match(/stage|phase|process|step|चरण|प्रक्रिया/)) {
        return chatbotResponses['stages'];
    }
    return chatbotResponses['default'];
}

const quizQuestions = [
    {
        id: 1,
        question: "What is the minimum age to vote in India?",
        questionHi: "भारत में वोट देने की न्यूनतम आयु क्या है?",
        options: ["16", "18", "21", "25"],
        optionsHi: ["16", "18", "21", "25"],
        correctAnswer: 1,
        explanation: "Since 1988, the voting age in India is 18 years for all citizens.",
        explanationHi: "1988 से, भारत में सभी नागरिकों के लिए मतदान की आयु 18 वर्ष है।"
    },
    {
        id: 2,
        question: "What does VVPAT stand for?",
        questionHi: "VVPAT का पूर्ण रूप क्या है?",
        options: ["Voter Verified Paper Audit Trail", "Visual Vote Paper Access Track", "Voter Verified Print Audit Tool", "Variable Vote Paper Audit Trace"],
        optionsHi: ["वोटर वेरिफाइड पेपर ऑडिट ट्रेल", "विजुअल वोट पेपर एक्सेस ट्रैक", "वोटर वेरिफाइड प्रिंट ऑडिट टूल", "वेरिएबल वोट पेपर ऑडिट ट्रेस"],
        correctAnswer: 0,
        explanation: "VVPAT provides a physical paper slip to verify your vote on the EVM.",
        explanationHi: "वीवीपीएटी (VVPAT) ईवीएम पर आपके वोट को सत्यापित करने के लिए एक भौतिक कागज़ की पर्ची प्रदान करता है।"
    },
    {
        id: 3,
        question: "Who appoints the Chief Election Commissioner of India?",
        questionHi: "भारत के मुख्य चुनाव आयुक्त की नियुक्ति कौन करता है?",
        options: ["The Prime Minister", "The Chief Justice", "The President of India", "The Parliament"],
        optionsHi: ["प्रधानमंत्री", "मुख्य न्यायाधीश", "भारत के राष्ट्रपति", "संसद"],
        correctAnswer: 2,
        explanation: "The President of India appoints the CEC and other Election Commissioners.",
        explanationHi: "भारत के राष्ट्रपति मुख्य चुनाव आयुक्त (CEC) और अन्य चुनाव आयुक्तों की नियुक्ति करते हैं।"
    },
    {
        id: 4,
        question: "What is the maximum number of candidates an EVM can support?",
        questionHi: "एक ईवीएम अधिकतम कितने उम्मीदवारों का समर्थन कर सकती है?",
        options: ["16", "32", "64", "128"],
        optionsHi: ["16", "32", "64", "128"],
        correctAnswer: 2,
        explanation: "A single Balloting Unit can support 16 candidates, and up to 4 units can be linked (64 total).",
        explanationHi: "एक सिंगल बैलेटिंग यूनिट 16 उम्मीदवारों का समर्थन कर सकती है, और अधिकतम 4 यूनिट को जोड़ा जा सकता है (कुल 64)।"
    },
    {
        id: 5,
        question: "Which state was the first to use EVMs in all its assembly constituencies?",
        questionHi: "अपनी सभी विधानसभा क्षेत्रों में ईवीएम का उपयोग करने वाला पहला राज्य कौन सा था?",
        options: ["Kerala", "Goa", "Gujarat", "Delhi"],
        optionsHi: ["केरल", "गोवा", "गुजरात", "दिल्ली"],
        correctAnswer: 1,
        explanation: "Goa was the first state to use EVMs in all constituencies during the 1999 elections.",
        explanationHi: "1999 के चुनावों के दौरान गोवा सभी निर्वाचन क्षेत्रों में ईवीएम का उपयोग करने वाला पहला राज्य था।"
    },
    {
        id: 6,
        question: "What is the 'Silence Period' before polling starts?",
        questionHi: "मतदान शुरू होने से पहले 'मौन अवधि' (Silence Period) क्या है?",
        options: ["12 hours", "24 hours", "48 hours", "72 hours"],
        optionsHi: ["12 घंटे", "24 घंटे", "48 घंटे", "72 घंटे"],
        correctAnswer: 2,
        explanation: "Campaigning must stop 48 hours before the time fixed for the conclusion of poll.",
        explanationHi: "चुनाव प्रचार मतदान समाप्त होने के लिए निर्धारित समय से 48 घंटे पहले बंद होना चाहिए।"
    },
    {
        id: 7,
        question: "What color is the ink mark used on a voter's finger?",
        questionHi: "मतदाता की उंगली पर इस्तेमाल किए जाने वाले स्याही के निशान का रंग क्या है?",
        options: ["Black", "Indelible Purple", "Blue", "Red"],
        optionsHi: ["काला", "अमिट बैंगनी", "नीला", "लाल"],
        correctAnswer: 1,
        explanation: "Indelible ink is purple and contains silver nitrate, which makes it resistant to soap and water.",
        explanationHi: "अमिट स्याही बैंगनी होती है और इसमें सिल्वर नाइट्रेट होता है, जो इसे साबुन और पानी के प्रति प्रतिरोधी बनाता है।"
    },
    {
        id: 8,
        question: "What is the term of a Member of the Rajya Sabha?",
        questionHi: "राज्यसभा के सदस्य का कार्यकाल क्या है?",
        options: ["4 years", "5 years", "6 years", "Permanent"],
        optionsHi: ["4 साल", "5 साल", "6 साल", "स्थायी"],
        correctAnswer: 2,
        explanation: "Members of Rajya Sabha are elected for 6 years, with one-third retiring every 2 years.",
        explanationHi: "राज्यसभा के सदस्य 6 साल के लिए चुने जाते हैं, जिनमें से एक तिहाई हर 2 साल में सेवानिवृत्त होते हैं।"
    }
];

app.get('/api/quiz', (req, res) => {
    const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random());
    res.json(shuffled.slice(0, 5));
});


app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (typeof message !== 'string' || !message.trim()) {
        return res.json({ reply: chatbotResponses['default'] });
    }

    if (model) {
        try {
            const result = await model.generateContent(message);
            const response = await result.response;
            const reply = response.text();
            return res.json({ reply });
        } catch (error) {
            console.error('❌ Gemini API Error:', error.message || error);
            console.error('   Falling back to keyword matching for this request.\n');
        }
    }

    const reply = getKeywordResponse(message);
    res.json({ reply });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'NirvachanMitra API is running',
        geminiEnabled: keyIsValid
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`   Gemini AI: ${keyIsValid ? 'ENABLED ✅' : 'DISABLED ❌ (invalid/missing API key)'}\n`);
});