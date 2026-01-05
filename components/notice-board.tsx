import { Pin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function NoticeBoard() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="py-2 px-4 border-b border-accent">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Pin className="w-4 h-4 text-muted-foreground" />
          Mural de avisos
        </CardTitle>
      </CardHeader>
      <CardContent className="py-6 px-4">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <Pin className="w-10 h-10 text-muted-foreground/30" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-muted-foreground/60 text-center font-medium">Nenhum aviso para ser exibido</p>
          <Button className="bg-accent hover:bg-accent/80 text-[#ff6b35] font-semibold px-6 h-8 text-xs" variant="secondary">
            VER AVISOS
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
