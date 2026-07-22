import {
    FormEvent,
    useEffect,
    useState,
  } from "react";
  
  import { Button } from "@/components/ui/button";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import {
    type Id,
    type VoterSearchResult,
    searchVoters,
    verifyVoter,
  } from "@/services/electionService";
  
  interface VerificationFormProps {
    onVerified: (voter: {
      id: Id;
      name: string;
    }) => void;
  }
  
  export default function VerificationForm({
    onVerified,
  }: VerificationFormProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [matchingVoters, setMatchingVoters] = useState<
      VoterSearchResult[]
    >([]);
    const [selectedVoter, setSelectedVoter] =
      useState<VoterSearchResult | null>(null);
    const [contact, setContact] = useState("");
    const [error, setError] = useState("");
    const [isSearching, setIsSearching] =
      useState(false);
    const [isVerifying, setIsVerifying] =
      useState(false);
    const [hasCompletedSearch, setHasCompletedSearch] =
      useState(false);
  
    useEffect(() => {
      const query = searchTerm.trim();
  
      if (query.length < 2 || selectedVoter) {
        setMatchingVoters([]);
        setHasCompletedSearch(false);
        return;
      }
  
      const controller = new AbortController();
  
      const timeout = window.setTimeout(async () => {
        try {
          setIsSearching(true);
          setError("");
          setHasCompletedSearch(false);
  
          const response = await searchVoters(query);
  
          if (controller.signal.aborted) {
            return;
          }
  
          setMatchingVoters(response.voters || []);
          setHasCompletedSearch(true);
        } catch (error) {
          if (controller.signal.aborted) {
            return;
          }
  
          setMatchingVoters([]);
          setHasCompletedSearch(true);
          setError(
            error instanceof Error
              ? error.message
              : "Unable to search for voters."
          );
        } finally {
          if (!controller.signal.aborted) {
            setIsSearching(false);
          }
        }
      }, 400);
  
      return () => {
        controller.abort();
        window.clearTimeout(timeout);
      };
    }, [searchTerm, selectedVoter]);
  
    function clearSelectedVoter() {
      setSelectedVoter(null);
      setSearchTerm("");
      setContact("");
      setMatchingVoters([]);
      setError("");
      setHasCompletedSearch(false);
    }
  
    async function handleSubmit(
      event: FormEvent<HTMLFormElement>
    ) {
      event.preventDefault();
      setError("");
  
      if (!selectedVoter) {
        setError(
          "Please search for and select your name."
        );
        return;
      }
  
      const normalizedContact = contact.trim();
  
      if (!normalizedContact) {
        setError(
          "Please enter the email address or phone number registered with the organization."
        );
        return;
      }
  
      try {
        setIsVerifying(true);
  
        const response = await verifyVoter(
          selectedVoter.id,
          normalizedContact
        );
  
        if (!response.voter) {
          setError(
            response.message ||
              "Voter verification failed."
          );
          return;
        }
  
        onVerified({
          id: response.voter.id,
          name: response.voter.name,
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Voter verification failed."
        );
      } finally {
        setIsVerifying(false);
      }
    }
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Voter Verification</CardTitle>
  
          <p className="text-sm text-slate-600">
            Find your name and verify yourself using
            the email address or phone number registered
            with the organization.
          </p>
        </CardHeader>
  
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="relative">
              <label
                htmlFor="voter-search"
                className="mb-2 block text-sm font-medium"
              >
                Search your name
              </label>
  
              <Input
                id="voter-search"
                type="search"
                placeholder="Start typing your full name"
                value={searchTerm}
                autoComplete="off"
                disabled={Boolean(selectedVoter)}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setSelectedVoter(null);
                  setError("");
                  setHasCompletedSearch(false);
                }}
              />
  
              {selectedVoter && (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                      Selected voter
                    </p>
  
                    <p className="font-semibold text-slate-900">
                      {selectedVoter.name}
                    </p>
  
                    {selectedVoter.location && (
                      <p className="text-sm text-slate-600">
                        {selectedVoter.location}
                      </p>
                    )}
                  </div>
  
                  <button
                    type="button"
                    className="text-sm font-semibold text-green-800 hover:underline"
                    onClick={clearSelectedVoter}
                  >
                    Change
                  </button>
                </div>
              )}
  
              {isSearching && (
                <p className="mt-2 text-sm text-slate-500">
                  Searching voter register...
                </p>
              )}
  
              {!isSearching &&
                matchingVoters.length > 0 &&
                !selectedVoter && (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border bg-white shadow-lg">
                    {matchingVoters.map((voter) => (
                      <button
                        key={String(voter.id)}
                        type="button"
                        className="block w-full border-b px-4 py-3 text-left text-sm last:border-b-0 hover:bg-slate-50"
                        onClick={() => {
                          setSelectedVoter(voter);
                          setSearchTerm(voter.name);
                          setMatchingVoters([]);
                          setError("");
                        }}
                      >
                        <span className="block font-medium text-slate-900">
                          {voter.name}
                        </span>
  
                        {voter.location && (
                          <span className="text-xs text-slate-500">
                            {voter.location}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
  
              {!isSearching &&
                hasCompletedSearch &&
                searchTerm.trim().length >= 2 &&
                matchingVoters.length === 0 &&
                !selectedVoter &&
                !error && (
                  <p className="mt-2 text-sm text-slate-500">
                    No matching voter found.
                  </p>
                )}
            </div>
  
            <div>
              <label
                htmlFor="voter-contact"
                className="mb-2 block text-sm font-medium"
              >
                Registered email or phone number
              </label>
  
              <Input
                id="voter-contact"
                type="text"
                inputMode="text"
                placeholder="Email address or phone number"
                value={contact}
                autoComplete="off"
                disabled={!selectedVoter}
                onChange={(event) => {
                  setContact(event.target.value);
                  setError("");
                }}
              />
  
              <p className="mt-2 text-xs text-slate-500">
                Enter either one. It must match the
                information in the voter register.
              </p>
            </div>
  
            {error && (
              <p
                role="alert"
                className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}
  
            <Button
              type="submit"
              className="w-full"
              disabled={
                isVerifying ||
                !selectedVoter ||
                !contact.trim()
              }
            >
              {isVerifying
                ? "Verifying..."
                : "Verify and Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }