import { HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function HelpCenter() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <HelpCircle className="w-5 h-5 text-muted-foreground" />
          Central de ajuda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Aqui você terá acesso às atualizações da base de conhecimento da Constel Tecnologia
        </p>
      </CardContent>
    </Card>
  )
}
