import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground">
          Lead list — intent, urgency, budget, location, timeline, readiness score
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
          <p className="text-sm text-muted-foreground">
            Structured fields, notes, and next-best-action recommendations
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No contacts yet.</p>
        </CardContent>
      </Card>
    </section>
  )
}