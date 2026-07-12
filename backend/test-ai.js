import { execSync } from 'child_process'

const tokenCmd = "curl -s -X POST http://localhost:4000/api/v1/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@assetflow.demo\",\"password\":\"Admin@123456\"}' | grep -o '\"accessToken\":\"[^\"]*' | cut -d'\"' -f4"

const token = execSync(tokenCmd).toString().trim()

const testPrompt = async (prompt) => {
  const res = await fetch('http://localhost:4000/api/v1/ai/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
  })
  const json = await res.json()
  console.log(`\n--- PROMPT: ${prompt} ---`)
  console.log(json.data)
}

const run = async () => {
  await testPrompt("Show broken laptops.")
  await testPrompt("Pending bookings.")
  await testPrompt("Summarize maintenance.")
  await testPrompt("What is the capital of France?")
  await testPrompt("Show my assets.") // As admin, this might show all or none depending on assignment
}

run()
