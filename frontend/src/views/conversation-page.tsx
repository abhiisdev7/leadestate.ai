import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function ConversationPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Conversation</h1>
        <p className="text-muted-foreground">
          Email conversation view — simulates inbound handling
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thread</CardTitle>
            <p className="text-sm text-muted-foreground">
              Buyer/seller inquiries, property questions, financing context
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">No conversation selected. Pick a lead from Contacts.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Reply</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea placeholder="Type your reply..." rows={4} className="resize-none" />
            <Button className="w-full">Send</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
