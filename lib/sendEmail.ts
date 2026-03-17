import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendApprovalEmail(email: string, stageName?: string) {
  await sgMail.send({
    to: email,
    from: "no-reply@sawaflix.com",
    subject: "🎉 Your Creator Account Has Been Approved",
    html: `
      <h2>Congratulations ${stageName || ""}!</h2>
      <p>Your creator application has been approved.</p>
      <p>You can now upload music, movies, and stories on SawaFlix.</p>
    `,
  });
}

export async function sendRejectionEmail(
  email: string,
  reason: string
) {
  await sgMail.send({
    to: email,
    from: "no-reply@sawaflix.com",
    subject: "Creator Application Update",
    html: `
      <h2>Your application was not approved</h2>
      <p>Reason:</p>
      <p>${reason}</p>
      <p>You can reapply after 30 days.</p>
    `,
  });
}