import axios from "axios";
import { handleError } from "../utils/responseHandler.js";
import { StatusCodes } from "http-status-codes";

const generateGeminiText = async (prompt, actionName) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn(`⚠️ [AI] GEMINI_API_KEY is not set. Using mock response for "${actionName}".`);
    return getMockResponse(prompt, actionName);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(url, {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    });

    const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      throw new Error("Invalid response format from Gemini API");
    }
    return resultText.trim();
  } catch (error) {
    console.error(`❌ [AI] Gemini API error for "${actionName}":`, error.message);
    
    return getMockResponse(prompt, actionName);
  }
};

const getMockResponse = (prompt, action) => {
  const cleanAction = action.toLowerCase();
  
  
  let title = "News Article";
  const titleMatch = prompt.match(/Title:\s*(.*)/i);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].split("\n")[0].trim();
  }

  const notice = "\n\n*(Note: This is an AI-generated mock response since GEMINI_API_KEY is not set in news-server/.env)*";

  if (cleanAction === "explain") {
    
    const langMatch = prompt.match(/language:\s*([a-zA-Z\s]+)/i);
    const lang = langMatch ? langMatch[1].trim().toLowerCase() : "english";

    if (lang.includes("kinyarwanda") || lang.includes("rw")) {
      return `Mwaramutse! Dore ubusobanuro bworoheje bw'iyi nkuru yitwa "${title}":\n\nIyi nkuru iragaragaza ingingo y'ingenzi ivugwa muri iyi nyandiko aho isobanura neza uko ibintu byifashe, ingaruka zabyo, n'icyo abantu bakwiye kubivugaho. Igamije gufasha abasomyi gusobanukirwa neza mu buryo bworoshye bitagoranye binyuze mu busesenguzi bwimbitse bw'amakuru. Ubu ni uburyo bwiza bwo kumenya amakuru yose agezweho mu rurimi rwacu rw'Ikinyarwanda!${notice}`;
    } else if (lang.includes("french") || lang.includes("fr")) {
      return `Bonjour! Voici une explication simple et claire de l'article intitulé "${title}":\n\nCet article explique les événements clés, leur contexte et leur impact potentiel. Il vise à simplifier les détails complexes pour le lecteur afin qu'il puisse comprendre les aspects les plus importants du sujet sans jargon technique.${notice}`;
    } else if (lang.includes("swahili") || lang.includes("sw")) {
      return `Habari! Huu hapa ni ufafanuzi rahisi wa makala yenye kichwa cha habari "${title}":\n\nMakala haya yanafafanua matukio muhimu na muktadha wake kwa njia rahisi. Yanalenga kumsaidia msomaji kuelewa kwa urahisi mada kuu na athari zake bila kutumia lugha ngumu.${notice}`;
    } else if (lang.includes("spanish") || lang.includes("es")) {
      return `¡Hola! Aquí tiene una explicación sencilla del artículo titulado "${title}":\n\nEste artículo resume los puntos clave y el contexto de los hechos de manera sencilla. Su objetivo es ayudar al lector a comprender el impacto de la noticia de forma accesible y clara.${notice}`;
    } else {
      return `Hello! Here is a simple, easy-to-understand explanation of the article "${title}":\n\nThis article outlines the main events, context, and prospective impact. It breaks down the technical details so that readers can quickly grasp what is happening and why it matters to the general public.${notice}`;
    }
  }

  switch (cleanAction) {
    case "analyze":
      return `📊 **Article Analysis: ${title}**

1. **Tone:** Informative, professional, and balanced.
2. **Readability:** High (appropriate for the general public, clear structure).
3. **Key Themes:** Growth, development, and regional impact.
4. **Suggestions:** Consider adding quotes from local experts or extra data points to enhance depth.${notice}`;

    case "improve":
      return `✨ **Improved Version**

"${title}" has been updated with more vibrant transitions, stronger action verbs, and refined sentence structures to keep readers engaged from start to finish. All core facts remain identical, but readability is significantly enhanced.${notice}`;

    case "grammar":
      return `✍️ **Grammar & Spelling Correction**

The text has been scanned and all minor grammar, spelling, and punctuation errors have been corrected. The narrative flow is now polished and ready for publication.${notice}`;

    case "headlines":
      return `📰 **Suggested Catchy Headlines**

1. BREAKING: The Real Story Behind ${title}
2. How ${title} is Changing the Industry Landscape
3. The Ultimate Guide to Understanding ${title}
4. Why Everyone is Talking About ${title} Right Now
5. EXCLUSIVE: Key Insights into ${title}${notice}`;

    case "summary":
      return `📝 **Summary**
This article covers the main updates regarding ${title}, detailing the current status, recent events, and expected impact on local communities and the broader market.${notice}`;

    case "seo":
      return `🔍 **SEO Meta Tags**

* **SEO Title:** ${title} | Latest Updates & News
* **Meta Description:** Get the full breakdown and latest details about ${title}. Read our in-depth coverage and insights here.${notice}`;

    case "keywords":
      return `🏷️ **Keywords & Tags**
news, global, ${title.toLowerCase().replace(/[^a-z0-9]/g, ", ")}, updates, trending, current events${notice}`;

    case "translate":
      return `🌐 **Translation (Title & Content)**

*Title:* Translated title of "${title}"
*Content:* Translated body content representing the original facts in the requested target language.${notice}`;

    case "socialpost":
      return `📱 **Social Media Post**

Read our latest piece: "${title}"! 📢 Breaking down everything you need to know about this story. 

Read the full details here: 👇
🔗 [Link]

#news #breaking #trending #globalupdates${notice}`;

    default:
      return `AI Response for ${action} of "${title}"${notice}`;
  }
};

export const analyzeArticle = async (req, res) => {
  const { title, content } = req.body;
  const prompt = `Analyze the following news article title and content. Provide key insights, tone analysis, readability, and suggestions for improvement:\nTitle: ${title}\nContent: ${content}`;
  const result = await generateGeminiText(prompt, "analyze");
  return res.status(StatusCodes.OK).json({ success: true, result });
};

export const improveWriting = async (req, res) => {
  const { title, content } = req.body;
  const prompt = `Rewrite and improve the following article content to make it more engaging, clear, and professional while retaining all facts:\nTitle: ${title}\nContent: ${content}`;
  const result = await generateGeminiText(prompt, "improve");
  return res.status(StatusCodes.OK).json({ success: true, result });
};


export const fixGrammar = async (req, res) => {
  const { title, content } = req.body;
  const prompt = `Proofread the following article content. Correct any grammatical, spelling, and punctuation errors. Return the polished version directly:\nTitle: ${title}\nContent: ${content}`;
  const result = await generateGeminiText(prompt, "grammar");
  return res.status(StatusCodes.OK).json({ success: true, result });
};

export const generateHeadlines = async (req, res) => {
  const { title, content } = req.body;
  const prompt = `Generate 5 catchy, high-CTR headlines for the following news article:\nTitle: ${title}\nContent: ${content}`;
  const result = await generateGeminiText(prompt, "headlines");
  return res.status(StatusCodes.OK).json({ success: true, result });
};


export const generateSummary = async (req, res) => {
  const { title, content } = req.body;
  const prompt = `Generate a concise summary (around 2-3 sentences) of the following news article:\nTitle: ${title}\nContent: ${content}`;
  const result = await generateGeminiText(prompt, "summary");
  return res.status(StatusCodes.OK).json({ success: true, result });
};


export const optimizeSeo = async (req, res) => {
  const { title, content } = req.body;
  const prompt = `Provide an optimized SEO Title and a compelling Meta Description for the following article. Format clearly as SEO Title and Meta Description:\nTitle: ${title}\nContent: ${content}`;
  const result = await generateGeminiText(prompt, "seo");
  return res.status(StatusCodes.OK).json({ success: true, result });
};


export const extractKeywords = async (req, res) => {
  const { title, content } = req.body;
  const prompt = `Extract the top 8 relevant keywords and tags from the following news article. Return them as a comma-separated list:\nTitle: ${title}\nContent: ${content}`;
  const result = await generateGeminiText(prompt, "keywords");
  return res.status(StatusCodes.OK).json({ success: true, result });
};

export const translateArticle = async (req, res) => {
  const { title, content, targetLanguage } = req.body;
  const prompt = `Translate the following news article content into ${targetLanguage}. Maintain the original tone and layout:\nTitle: ${title}\nContent: ${content}`;
  const result = await generateGeminiText(prompt, "translate");
  return res.status(StatusCodes.OK).json({ success: true, result });
};


export const generateSocialPost = async (req, res) => {
  const { title, content, platform } = req.body;
  const prompt = `Write a compelling social media post for ${platform} about this article. Include relevant emojis and hashtags:\nTitle: ${title}\nContent: ${content}`;
  const result = await generateGeminiText(prompt, "socialpost");
  return res.status(StatusCodes.OK).json({ success: true, result });
};

export const explainNews = async (req, res) => {
  try {
    const { title, content, targetLanguage } = req.body;
    if (!content) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Content is required" });
    }

    const language = targetLanguage || "English";
    const prompt = `Explain the following news article in detail, but in simple terms, using the language: ${language}. Make it extremely easy to read and understand for a layperson. Break it down into simple points if necessary:\nTitle: ${title}\nContent: ${content}`;
    
    const result = await generateGeminiText(prompt, "explain");
    
    return res.status(StatusCodes.OK).json({
      success: true,
      result
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};
