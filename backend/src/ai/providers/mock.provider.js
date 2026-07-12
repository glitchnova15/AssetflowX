export class MockProvider {
  async chat(messages, context) {
    return 'This is a mocked chat response based on the provided messages.'
  }

  async summarize(text) {
    return 'This is a mocked summary of the provided text.'
  }

  async search(query) {
    return 'This is a mocked search result for the query: ' + query
  }

  async recommend(context) {
    return 'These are mocked recommendations based on your context.'
  }
}
