import { NextResponse } from "next/server";
import { connectDB, Contact, Lead, Schedule } from "@/lib/db";
import { sendMeetingSchedulerEmail } from "@/lib/email/send";

/**
 * Test API to verify schedule_call logic: lead creation, appointment storage, and email.
 * POST with JSON body: { name, phone, email, date, time, purpose?, sendEmail?: boolean }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name = "Test Lead",
      phone = "(555) 123-4567",
      email = "test@example.com",
      date = "2025-02-20",
      time = "2:00 PM",
      purpose = "Discovery call",
      sendEmail = false,
    } = body as {
      name?: string;
      phone?: string;
      email?: string;
      date?: string;
      time?: string;
      purpose?: string;
      sendEmail?: boolean;
    };

    await connectDB();

    const appointment = {
      date,
      time,
      confirmed: true,
      channel: "inbound" as const,
      purpose,
    };

    const lead = await Lead.create({
      name,
      phone,
      email,
      channel: "inbound",
      status: "qualified",
      next_action: `Call scheduled – ${date} at ${time}`,
      appointments: [appointment],
    } as Record<string, unknown>);

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Failed to create lead" },
        { status: 500 }
      );
    }

    if (sendEmail && email) {
      try {
        const contact = await Contact.create({
          name,
          phone,
          email,
          source: "inbound",
        });
        const schedule = await Schedule.create({
          contact: contact._id,
          lead: lead._id,
          date,
          time,
          status: "confirmed",
          purpose,
          channel: "inbound",
        });
        await sendMeetingSchedulerEmail({
          to: email,
          leadName: name,
          date,
          time,
          purpose,
          scheduleId: schedule._id.toString(),
        });
        await Schedule.findByIdAndUpdate(schedule._id, {
          $set: {
            confirmationEmailMessageId: `<schedule-${schedule._id}@leadestate.local>`,
          },
        });
      } catch (err) {
        console.error("Test email failed:", err);
        return NextResponse.json({
          success: true,
          lead_id: lead._id.toString(),
          message: "Lead and appointment saved. Email failed.",
          emailError: String(err),
        });
      }
    }

    return NextResponse.json({
      success: true,
      lead_id: lead._id.toString(),
      message: "Lead and appointment saved to DB",
      lead: {
        _id: lead._id.toString(),
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        status: lead.status,
        appointments: lead.appointments,
      },
    });
  } catch (error) {
    console.error("Schedule call test error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
