import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendMatchEmail(params: {
  to: string;
  cycleKey: string;
  meetingTime: string;
  wherebyLink: string;
  groupCode: string;
}) {
  const from = process.env.RESEND_FROM_EMAIL;
  const resend = getResend();

  if (!resend || !from) {
    console.log("[email skipped]", params);
    return;
  }

  await resend.emails.send({
    from,
    to: params.to,
    subject: `Synchria match for ${params.cycleKey}`,
    html: `
      <p>Your Synchria group is ready.</p>
      <p><strong>Group:</strong> ${params.groupCode}</p>
      <p><strong>Time:</strong> ${new Date(params.meetingTime).toLocaleString()}</p>
      <p><strong>Whereby:</strong> <a href="${params.wherebyLink}">${params.wherebyLink}</a></p>
      <p>After meeting, submit feedback on the Status page.</p>
    `
  });
}
