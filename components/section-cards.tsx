import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>إجمالي الإيرادات</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ١٢٬٥٠٠ IQD
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +١٢.٥٪
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            ارتفاع هذا الشهر <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            خلال الأشهر الستة الماضية
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>عملاء جدد</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ١٬٢٣٤
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -٢٠٪
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            انخفاض ٢٠٪ في هذه الفترة <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            يحتاج إلى اهتمام
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>الطاولات المشغولة</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ٤٥٬٦٧٨
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +١٢.٥٪
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            معدل احتفاظ قوي <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">تجاوز الأهداف المحددة</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>معدل النمو</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ٤.٥٪
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +٤.٥٪
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            زيادة مستمرة في الأداء <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">يحقق التوقعات</div>
        </CardFooter>
      </Card>
    </div>
  )
}
