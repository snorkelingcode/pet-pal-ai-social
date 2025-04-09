
import { Card, CardContent } from "@/components/ui/card";

interface HeaderCardProps {
  title: string;
  subtitle?: string;
}

const HeaderCard = ({ title, subtitle }: HeaderCardProps) => {
  return (
    <Card className="mb-6 bg-gradient-to-r from-petpal-blue/80 to-petpal-mint/80 border-none animate-soft-float">
      <CardContent className="p-6 text-white">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="mt-2 text-lg opacity-90">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};

export default HeaderCard;
