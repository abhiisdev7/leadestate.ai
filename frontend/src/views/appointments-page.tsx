import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AppointmentsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">
          Propose slots, confirm, and handle reschedules
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming</CardTitle>
          <p className="text-sm text-muted-foreground">
            Scheduled showings and meetings
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No appointments scheduled.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Proposed Slots</CardTitle>
          <p className="text-sm text-muted-foreground">
            Awaiting lead confirmation
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">None pending.</p>
        </CardContent>
      </Card>
    </section>
  )
}
