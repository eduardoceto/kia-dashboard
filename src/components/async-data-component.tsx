import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { CheckCircle, Clock } from "lucide-react";

async function fetchData() {
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  return {
    title: "Component Loaded Successfully!",
    description: "This data was fetched asynchronously.",
    details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    author: "AI Assistant",
    avatarUrl: "/placeholder.svg?height=40&width=40&query=robot+avatar",
    status: "Completed"
  };
}

export default async function AsyncDataComponent() {
  const data = await fetchData();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={data.avatarUrl} alt={data.author} />
            <AvatarFallback>{data.author.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{data.title}</CardTitle>
            <CardDescription>{data.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{data.details}</p>
        <div className="flex items-center mt-4 text-sm text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          <span>{data.status}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Learn More</Button>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="w-3 h-3 mr-1" />
          <span>Loaded just now</span>
        </div>
      </CardFooter>
    </Card>
  );
}

AsyncDataComponent.defaultProps = {};
