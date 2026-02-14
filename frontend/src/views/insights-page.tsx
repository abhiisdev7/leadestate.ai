import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function InsightsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">
          Summary, objections, competitor mentions, risk flags, and action items
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversation Summary</CardTitle>
            <p className="text-sm text-muted-foreground">
              AI-generated summaries from email threads
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No insights yet. Insights appear after conversations.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Action Items</CardTitle>
            <p className="text-sm text-muted-foreground">
              Extracted tasks and follow-ups
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">None identified.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Objections & Risk Flags</CardTitle>
            <p className="text-sm text-muted-foreground">
              Competitor mentions, concerns, risk indicators
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">None detected.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
