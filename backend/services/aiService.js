const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
const sanitizeHtml = require("sanitize-html");
dotenv.config();

const ai = new GoogleGenAI({});

async function compareListings(listing1, listing2) {
  const prompt = `
Bạn là một chuyên gia tư vấn mua bán xe điện / pin. 
Nhiệm vụ: SO SÁNH hai listing và trả về **DUY NHẤT** một HTML fragment (không phải file HTML đầy đủ) để chèn trực tiếp vào frontend bằng innerHTML.

Yêu cầu định dạng HTML:
- Trả về **chỉ** HTML (KHÔNG giải thích, không JSON, không text thừa).
- HTML phải gồm các phần có class rõ ràng để FE style nếu muốn:
  - <div class="ai-comparison"> là container gốc
  - <div class="ai-alert"> nếu có vấn đề nghiêm trọng (ví dụ brand vs image mismatch)
  - <section class="ai-summary"> tổng quan ngắn
  - <section class="ai-features"> bảng hoặc danh sách so sánh (bên trái listing1, bên phải listing2)
  - <section class="ai-recommendation"> kết luận & lời khuyên (có nút hành động gợi ý như <a class="ai-action" href="#">Xem chi tiết</a>)
- Không được chèn <script> hoặc inline event handlers (vd: onclick). Không chèn CSS style tags. Chỉ cho phép semantic tags: div, section, h1..h4, p, ul, li, table, thead, tbody, tr, th, td, a, strong, em, small, span, img (với src nếu cần).
- Nếu chèn <img>, chỉ chèn url từ dữ liệu listing (không fetch ảnh).
- Nội dung phải ngắn gọn, chia mục rõ ràng (Ưu/nhược điểm, So sánh, Lời khuyên).
- Trả lời bằng tiếng Việt.

Dữ liệu (JSON) — sử dụng để phân tích:
Listing 1: ${JSON.stringify(listing1, null, 2)}
Listing 2: ${JSON.stringify(listing2, null, 2)}

**TRÌNH BÀY HTML MẪU (ví dụ cấu trúc, bạn phải tạo nội dung thực tế dựa trên dữ liệu):**
<div class="ai-comparison">
  <div class="ai-alert">...</div>
  <section class="ai-summary"><h3>Tổng quan</h3>...</section>
  <section class="ai-features"><table>...</table></section>
  <section class="ai-recommendation"><h3>Khuyến nghị</h3><p>...</p></section>
</div>

Chú ý: chỉ trả về HTML fragment. Không kèm chú thích hay ký tự thừa.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let html = response?.text ?? "";

    if (!html.trim().startsWith("<")) {
      html = `<div class="ai-comparison"><pre>${escapeHtml(html)}</pre></div>`;
    }

    const clean = sanitizeHtml(html, {
      allowedTags: [
        "div",
        "section",
        "h1",
        "h2",
        "h3",
        "h4",
        "p",
        "ul",
        "ol",
        "li",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "strong",
        "em",
        "small",
        "span",
        "a",
        "img",
        "pre",
        "code",
        "br",
      ],
      allowedAttributes: {
        a: ["href", "class", "target", "rel"],
        img: ["src", "alt", "class", "width", "height"],
        div: ["class"],
        section: ["class"],
        p: ["class"],
        table: ["class"],
        span: ["class"],
        pre: ["class"],
        code: ["class"],
      },
      allowedSchemesByTag: {
        a: ["http", "https", "mailto"],
        img: ["http", "https", "data"],
      },
      transformTags: {
        a: (tagName, attribs) => {
          const href = attribs.href || "#";
          return {
            tagName: "a",
            attribs: {
              href,
              target: "_blank",
              rel: "noopener noreferrer",
              class: attribs.class || "",
            },
          };
        },
      },
    });

    return clean;
  } catch (error) {
    console.error("AI Gemini Error:", error);
    throw new Error("Không thể so sánh sản phẩm bằng AI");
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

module.exports = { compareListings };
