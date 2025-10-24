import axios from 'axios';
import { AIOrchestrator } from './aiOrchestrator.js';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedDate?: string;
}

interface SearchResponse {
  results: SearchResult[];
  synthesis?: string;
  sources: string[];
  timestamp: Date;
}

export class SearchService {
  private aiOrchestrator: AIOrchestrator;
  private serpApiKey: string;
  private newsApiKey: string;

  constructor() {
    this.aiOrchestrator = new AIOrchestrator();
    this.serpApiKey = process.env.SERP_API_KEY || '';
    this.newsApiKey = process.env.NEWS_API_KEY || '';
  }

  /**
   * Comprehensive search across multiple sources
   */
  async search(
    query: string,
    options?: {
      includeNews?: boolean;
      includeAcademic?: boolean;
      synthesize?: boolean;
      maxResults?: number;
    }
  ): Promise<SearchResponse> {
    const maxResults = options?.maxResults || 10;
    const searches: Promise<SearchResult[]>[] = [];

    // Web search (always included)
    searches.push(this.searchWeb(query, maxResults));

    // Optional searches
    if (options?.includeNews) {
      searches.push(this.searchNews(query, maxResults));
    }

    if (options?.includeAcademic) {
      searches.push(this.searchAcademic(query, maxResults));
    }

    // Execute all searches in parallel
    const results = await Promise.all(searches);
    const allResults = results.flat();

    // Deduplicate by URL
    const uniqueResults = this.deduplicateResults(allResults);

    // AI synthesis of results
    let synthesis: string | undefined;
    if (options?.synthesize && uniqueResults.length > 0) {
      synthesis = await this.synthesizeResults(query, uniqueResults);
    }

    return {
      results: uniqueResults.slice(0, maxResults),
      synthesis,
      sources: uniqueResults.map(r => r.url),
      timestamp: new Date()
    };
  }

  /**
   * Search the web using SerpAPI or Brave Search
   */
  private async searchWeb(query: string, maxResults: number): Promise<SearchResult[]> {
    if (!this.serpApiKey) {
      // Fallback to mock results in development
      return this.getMockWebResults(query, maxResults);
    }

    try {
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          q: query,
          api_key: this.serpApiKey,
          num: maxResults,
          engine: 'google'
        }
      });

      return (response.data.organic_results || []).map((result: any) => ({
        title: result.title,
        url: result.link,
        snippet: result.snippet,
        source: 'web',
        publishedDate: result.date
      }));
    } catch (error) {
      console.error('Web search error:', error);
      return this.getMockWebResults(query, maxResults);
    }
  }

  /**
   * Search news articles
   */
  private async searchNews(query: string, maxResults: number): Promise<SearchResult[]> {
    if (!this.newsApiKey) {
      return [];
    }

    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: query,
          apiKey: this.newsApiKey,
          pageSize: maxResults,
          sortBy: 'relevancy',
          language: 'en'
        }
      });

      return (response.data.articles || []).map((article: any) => ({
        title: article.title,
        url: article.url,
        snippet: article.description,
        source: 'news',
        publishedDate: article.publishedAt
      }));
    } catch (error) {
      console.error('News search error:', error);
      return [];
    }
  }

  /**
   * Search academic papers
   */
  private async searchAcademic(query: string, maxResults: number): Promise<SearchResult[]> {
    try {
      // Using Semantic Scholar API (free, no key required)
      const response = await axios.get('https://api.semanticscholar.org/graph/v1/paper/search', {
        params: {
          query,
          limit: maxResults,
          fields: 'title,abstract,url,year,authors'
        }
      });

      return (response.data.data || []).map((paper: any) => ({
        title: paper.title,
        url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
        snippet: paper.abstract || 'No abstract available',
        source: 'academic',
        publishedDate: paper.year?.toString()
      }));
    } catch (error) {
      console.error('Academic search error:', error);
      return [];
    }
  }

  /**
   * Synthesize search results using AI
   */
  private async synthesizeResults(
    query: string,
    results: SearchResult[]
  ): Promise<string> {
    const context = results
      .slice(0, 5) // Use top 5 results
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.url}`)
      .join('\n\n');

    const prompt = `Based on these search results, provide a comprehensive answer to: "${query}"

Search Results:
${context}

Please synthesize this information into a clear, well-structured answer. Include relevant facts, cite sources by number [1], [2], etc., and provide a balanced perspective.`;

    let synthesis = '';

    await this.aiOrchestrator.streamResponse(
      { role: 'user', content: prompt },
      {
        model: 'gpt-4-turbo',
        onToken: (token) => { synthesis += token; },
        temperature: 0.7
      }
    );

    return synthesis;
  }

  /**
   * Deduplicate results by URL
   */
  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      if (seen.has(result.url)) {
        return false;
      }
      seen.add(result.url);
      return true;
    });
  }

  /**
   * Mock web results for development
   */
  private getMockWebResults(query: string, count: number): SearchResult[] {
    return Array.from({ length: Math.min(count, 3) }, (_, i) => ({
      title: `Result ${i + 1} for "${query}"`,
      url: `https://example.com/result-${i + 1}`,
      snippet: `This is a mock search result for the query: ${query}. In production, this would be real web search results.`,
      source: 'web',
      publishedDate: new Date().toISOString()
    }));
  }

  /**
   * Get trending topics
   */
  async getTrendingTopics(category?: string): Promise<any[]> {
    // Implementation for trending topics
    return [];
  }

  /**
   * Fact check a claim
   */
  async factCheck(claim: string): Promise<any> {
    const results = await this.search(`fact check: ${claim}`, {
      includeNews: true,
      synthesize: true,
      maxResults: 5
    });

    return {
      claim,
      verdict: 'needs_verification',
      evidence: results.results,
      analysis: results.synthesis
    };
  }
}
