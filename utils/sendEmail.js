import transporter from "../config/mailer.js";


export const sendNewArticleEmail = async ({ to, title, category, author, link }) => {
  await transporter.sendMail({
    from: `"NewsWire 📰" <${process.env.EMAIL_USER}>`,
    to,
    subject: `📰 new story: ${title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f7f4;padding:32px;border-radius:16px;">
        <div style="background:#111;padding:20px 28px;border-radius:12px;margin-bottom:24px;">
          <span style="color:#fff;font-size:20px;font-weight:900;">NEWS</span>
          <span style="color:#DC2626;font-size:20px;font-weight:900;">WIRE</span>
        </div>
        <h2 style="color:#111;font-size:22px;font-weight:900;margin-bottom:8px;">${title}</h2>
        <p style="color:#6B7280;font-size:13px;margin-bottom:4px;">
          📂 Category: <strong>${category}</strong> &nbsp;|&nbsp; ✍️ ${author}
        </p>
        <a href="${link}" style="display:inline-block;margin-top:20px;background:#DC2626;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;">
          se news →
        </a>
        <p style="color:#D1D5DB;font-size:11px;margin-top:28px;">
          your dont email lik this, <a href="#" style="color:#9CA3AF;">unsubscribe hano</a>.
        </p>
      </div>
    `,
  });
};

export const sendNewCommentEmail = async ({ to, articleTitle, commenter, comment, link }) => {
  await transporter.sendMail({
    from: `"NewsWire 📰" <${process.env.EMAIL_USER}>`,
    to,
    subject: `💬new Comment : ${articleTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f7f4;padding:32px;border-radius:16px;">
        <div style="background:#111;padding:20px 28px;border-radius:12px;margin-bottom:24px;">
          <span style="color:#fff;font-size:20px;font-weight:900;">NEWS</span>
          <span style="color:#DC2626;font-size:20px;font-weight:900;">WIRE</span>
        </div>
        <h2 style="color:#111;font-size:20px;font-weight:900;margin-bottom:8px;">💬 Comment Nshya!</h2>
        <p style="color:#6B7280;">
          <strong>${commenter}</strong> yanditse comment kuri inkuru yawe:
          <em>"${articleTitle}"</em>
        </p>
        <div style="background:#fff;border-left:4px solid #DC2626;padding:16px;border-radius:8px;margin:16px 0;color:#374151;font-size:14px;">
          "${comment}"
        </div>
        <a href="${link}" style="display:inline-block;background:#DC2626;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;">
          Reba Comment →
        </a>
      </div>
    `,
  });
};


export const sendNewUserEmail = async ({ to, name, email, country }) => {
  await transporter.sendMail({
    from: `"NewsWire 📰" <${process.env.EMAIL_USER}>`,
    to,
    subject: `👤 Umukiriya Mushya: ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f7f4;padding:32px;border-radius:16px;">
        <div style="background:#111;padding:20px 28px;border-radius:12px;margin-bottom:24px;">
          <span style="color:#fff;font-size:20px;font-weight:900;">NEWS</span>
          <span style="color:#DC2626;font-size:20px;font-weight:900;">WIRE</span>
        </div>
        <h2 style="color:#111;font-size:20px;font-weight:900;margin-bottom:16px;">👤 Umukiriya Mushya Yiyandikishije!</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${[
            ["Amazina", name],
            ["Email", email],
            ["Igihugu", country],
            ["Itariki", new Date().toLocaleDateString("rw-RW")],
          ].map(([k, v]) => `
            <tr>
              <td style="padding:10px 16px;background:#fff;font-weight:700;color:#6B7280;border-bottom:1px solid #F3F4F6;">${k}</td>
              <td style="padding:10px 16px;background:#fff;color:#111;border-bottom:1px solid #F3F4F6;">${v}</td>
            </tr>
          `).join("")}
        </table>
        <p style="color:#D1D5DB;font-size:11px;margin-top:24px;">NewsWire Admin Panel</p>
      </div>
    `,
  });
};