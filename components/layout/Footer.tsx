import Container from "./Container";

export default function Footer() {
  return (
    <footer className="border-t py-8">
      <Container>
        <p className="text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Ghanaian Community in Russia • GCR Election Portal
        </p>
      </Container>
    </footer>
  );
}