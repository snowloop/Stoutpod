export function App() {
  const platform =
    typeof window !== "undefined" && "stoutpod" in window
      ? window.stoutpod.platform
      : "browser";


  return (
    <main>
      <h1>Stoutpod</h1>
      <h1>Hey {"stoutpod" in window ? "hola" : "no"}</h1>
    </main>
  );
}