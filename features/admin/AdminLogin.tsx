"use client";

import { FormEvent, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginAdmin } from "@/services/electionService";

export default function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedPath =
    searchParams.get("next") || "/admin";

  const nextPath = requestedPath.startsWith("/admin")
    ? requestedPath
    : "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError(
        "Username and password are required."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await loginAdmin(
        username.trim(),
        password
      );

      if (!response.token || !response.admin) {
        setError(
          response.message || "Unable to sign in."
        );
        return;
      }

      window.sessionStorage.setItem(
        "gcr-admin-token",
        response.token
      );

      window.sessionStorage.setItem(
        "gcr-admin-user",
        JSON.stringify(response.admin)
      );

      if (response.expiresAt) {
        window.sessionStorage.setItem(
          "gcr-admin-expires-at",
          response.expiresAt
        );
      }

      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Section className="min-h-[calc(100vh-5rem)] bg-slate-50">
      <Container>
        <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                🇬🇭
              </div>

              <CardTitle className="mt-5 text-3xl">
                Election Administration
              </CardTitle>

              <p className="mt-2 text-sm text-slate-600">
                Association of Compatriots —
                Ghanaian Community in Russia
              </p>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="admin-username"
                    className="mb-2 block text-sm font-medium"
                  >
                    Username
                  </label>

                  <Input
                    id="admin-username"
                    value={username}
                    autoComplete="username"
                    disabled={isSubmitting}
                    autoFocus
                    onChange={(event) => {
                      setUsername(event.target.value);
                      setError("");
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-password"
                    className="mb-2 block text-sm font-medium"
                  >
                    Password
                  </label>

                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Signing in..."
                    : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
}