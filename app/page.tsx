import Hero from "@/features/home/Hero";
import CurrentElection from "@/features/home/CurrentElection";
import CandidatePreview from "@/features/home/CandidatePreview";
import ElectionTimeline from "@/features/home/ElectionTimeline";
import Announcements from "@/features/home/Announcements";
import AfricanLeadersTrivia from "@/features/home/AfricanLeadersTrivia";

export default function Home() {
  return (
    <>
      <Hero />
      <CurrentElection />
      <CandidatePreview />
      <ElectionTimeline />
      <Announcements />
      <AfricanLeadersTrivia />
    </>
  );
}