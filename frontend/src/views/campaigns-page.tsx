import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CampaignsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground">
          Nurture sequences, objection handling, re-engagement campaigns
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Outbound Follow-ups</CardTitle>
          <p className="text-sm text-muted-foreground">
            Automated nurture and re-engagement sequences
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No campaigns configured.</p>
        </CardContent>
      </Card>
    </section>
  )
}