import Hero from "@/features/home/Hero";
import CurrentElection from "@/features/home/CurrentElection";
import Announcements from "@/features/home/Announcements";
import ElectionTimeline from "@/features/home/ElectionTimeline";
import CandidatePreview from "@/features/home/CandidatePreview";
import AfricanLeadersTrivia from "@/features/home/AfricanLeadersTrivia";
import QuickLinks from "@/features/home/QuickLinks";

export default function Home() {
  return (
    <>
      <Hero />
      <CurrentElection />
      <Announcements />
      <ElectionTimeline />
      <CandidatePreview />
      <AfricanLeadersTrivia />
      <QuickLinks />
    </>
  );
}