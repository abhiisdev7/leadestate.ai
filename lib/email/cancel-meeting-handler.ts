import { connectDB, Lead, Schedule } from "@/lib/db";
import { sendCancellationReply } from "./reply";

export interface CancelMeetingParams {
  scheduleId: string;
  to: string;
  leadName: string;
  date: string;
  time: string;
  ourMessageId: string;
  customerMessageId: string;
  subject: string;
}

export async function handleCancelMeeting(params: CancelMeetingParams): Promise<void> {
  const {
    scheduleId,
    to,
    leadName,
    date,
    time,
    ourMessageId,
    customerMessageId,
    subject,
  } = params;

  await connectDB();

  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    console.warn(`Schedule ${scheduleId} not found, sending reply anyway`);
    await sendCancellationReply({
      to,
      leadName,
      date,
      time,
      inReplyTo: customerMessageId,
      references: [ourMessageId, customerMessageId].filter(Boolean),
      subject,
    });
    return;
  }

  await Schedule.findByIdAndUpdate(scheduleId, { $set: { status: "cancelled" } });

  if (schedule.lead) {
    const lead = await Lead.findById(schedule.lead);
    if (lead && lead.appointments?.length) {
      const filteredAppointments = lead.appointments.filter(
        (a) => !(a.date === date && a.time === time)
      );
      await Lead.findByIdAndUpdate(schedule.lead, {
        $set: {
          appointments: filteredAppointments,
          next_action: "Meeting cancelled per customer request",
        },
      });
      const memory = lead.memory ?? {};
      memory.notes = [...(memory.notes ?? []), `Meeting cancelled via email reply on ${date} at ${time}`];
      await Lead.findByIdAndUpdate(schedule.lead, { $set: { memory } });
    }
  }

  await sendCancellationReply({
    to,
    leadName,
    date,
    time,
    inReplyTo: customerMessageId,
    references: [ourMessageId, customerMessageId].filter(Boolean),
    subject,
  });
}
