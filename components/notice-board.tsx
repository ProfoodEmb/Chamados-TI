import { Pin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function NoticeBoard() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b border-accent">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Pin className="w-5 h-5 text-muted-foreground" />
          Mural de avisos
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-12 pb-12">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 flex items-center justify-center">
            <Pin className="w-16 h-16 text-muted-foreground/30" strokeWidth={1.5} />
          </div>
          <p className="text-muted-foreground/60 text-center font-medium">Nenhum aviso para ser exibido</p>
          <Button className="mt-2 bg-accent hover:bg-accent/80 text-[#ff6b35] font-semibold px-8" variant="secondary">
            VER AVISOS
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
