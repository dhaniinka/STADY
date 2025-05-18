import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import Link from "next/link";
import { BrainCircuit, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-950">
        <div className="flex items-center gap-2">
          <img src = "/images/logo-stady2.png" alt="Logo" className="h-12 w-8 ml-4" />
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="py-20 px-6 text-center gradient-bg text-white">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Make Learning Awesome!
            </h1>
            <p className="text-xl mb-8">
              Create engaging quizzes or join as a student to test your
              knowledge in a fun, interactive way.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-100"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-white dark:bg-gray-950">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose <span className="text-primary">STADY</span>?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="quiz-card">
                <CardContent className="pt-6">
                  <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Engaging Quizzes</h3>
                  <p className="text-muted-foreground">
                    Create colorful, interactive quizzes that keep students
                    engaged and excited to learn.
                  </p>
                </CardContent>
              </Card>
              <Card className="quiz-card">
                <CardContent className="pt-6">
                  <div className="mb-4 bg-secondary/10 p-3 rounded-full w-fit">
                    <Sparkles className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Real-time Results</h3>
                  <p className="text-muted-foreground">
                    Get instant feedback and detailed analytics on student
                    performance.
                  </p>
                </CardContent>
              </Card>
              <Card className="quiz-card">
                <CardContent className="pt-6">
                  <div className="mb-4 bg-accent/10 p-3 rounded-full w-fit">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Easy to Use</h3>
                  <p className="text-muted-foreground">
                    Simple interface for both teachers and students with no
                    learning curve.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">
              Ready to make learning fun?
            </h2>
            <Link href="/register">
              <Button size="lg" className="animate-bounce-slow">
                Create Your First Quiz
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-6 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <img src = "/images/logo-stady2.png" alt="Logo" className="h- w-8" />
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Stady. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}