interface CardProps {
  id: number;
  title: string;
  img: string;
  desc: string;
}

export default function Card({ title, img, desc }: CardProps) {
  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card)] hover:shadow-accent/20 transition-all duration-300 hover:-translate-y-1">
      <div className="overflow-hidden">
        <img 
          src={img} 
          alt={title} 
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
