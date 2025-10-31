const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
dotenv.config();

const ai = new GoogleGenAI({});

async function compareListings(listing1, listing2) {
  const prompt = `
Bạn là một chuyên gia tư vấn mua bán xe/pin.
So sánh hai sản phẩm dưới đây và đưa ra:
1. Ưu/nhược điểm từng sản phẩm
2. Sản phẩm nào tốt hơn cho khách hàng
3. Lời khuyên mua hàng

Listing 1: ${JSON.stringify(listing1, null, 2)}
Listing 2: ${JSON.stringify(listing2, null, 2)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("AI Gemini Error:", error);
    throw new Error("Không thể so sánh sản phẩm bằng AI");
  }
}

module.exports = { compareListings };
