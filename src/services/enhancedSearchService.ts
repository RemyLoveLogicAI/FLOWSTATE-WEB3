/**
 * Enhanced Search Service - GenSpark-Style Research
 * 
 * Features:
 * - Multi-source aggregation (web, news, academic, social)
 * - AI-powered synthesis
 * - Citation management
 * - Deep research capabilities
 * - Real-time information
 */

import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  timestamp?: string;
  relevance?: number;
  metadata?: any;
}

export interface ResearchResult {
  query: string;
  results: SearchResult[];
  synthesis: string;
  sources: {
    title: string;
    url: string;
    snippet: string;
  }[];
  confidence: number;
  timestamp: number;
}

export class EnhancedSearchService {
  private anthropic: Anthropic;
  private searchAPIs: {
    brave?: string;
    serper?: string;
    tavily?: string;
  };

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

    this.searchAPIs = {
      brave: process.env.BRAVE_SEARCH_API_KEY,
      serper: process.env.SERPER_API_KEY,
      tavily: process.env.TAVILY_API_KEY,
    };
  }

  /**
   * GenSpark-style deep research
   * Performs comprehensive multi-source research with AI synthesis
   */
  async deepResearch(query: string): Promise<ResearchResult> {
    console.log(`🔍 Starting deep research for: ${query}`);

    // Phase 1: Multi-source search
    const [webResults, newsResults, academicResults] = await Promise.allSettled([
      this.searchWeb(query),
      this.searchNews(query),
      this.searchAcademic(query),
    ]);

    // Combine all results
    const allResults: SearchResult[] = [
      ...(webResults.status === 'fulfilled' ? webResults.value : []),
      ...(newsResults.status === 'fulfilled' ? newsResults.value : []),
      ...(academicResults.status === 'fulfilled' ? academicResults.value : []),
    ];

    // Phase 2: Rank by relevance
    const rankedResults = this.rankResults(allResults, query);
    const topResults = rankedResults.slice(0, 10);

    // Phase 3: AI-powered synthesis
    const synthesis = await this.synthesizeResults(query, topResults);

    // Phase 4: Extract sources
    const sources = topResults.map(r => ({
      title: r.title,
      url: r.url,
      snippet: r.snippet,
    }));

    return {
      query,
      results: topResults,
      synthesis,
      sources,
      confidence: this.calculateConfidence(topResults),
      timestamp: Date.now(),
    };
  }

  /**
   * Search the web using available APIs
   */
  private async searchWeb(query: string): Promise<SearchResult[]> {
    // Try Brave Search first (best for comprehensive results)
    if (this.searchAPIs.brave) {
      return await this.searchWithBrave(query);
    }

    // Fallback to Serper
    if (this.searchAPIs.serper) {
      return await this.searchWithSerper(query);
    }

    // Fallback to Tavily
    if (this.searchAPIs.tavily) {
      return await this.searchWithTavily(query);
    }

    // If no API keys, return mock results (for development)
    return this.getMockResults(query);
  }

  /**
   * Search news sources
   */
  private async searchNews(query: string): Promise<SearchResult[]> {
    if (this.searchAPIs.serper) {
      try {
        const response = await axios.post(
          'https://google.serper.dev/news',
          {
            q: query,
            num: 10,
          },
          {
            headers: {
              'X-API-KEY': this.searchAPIs.serper,
              'Content-Type': 'application/json',
            },
          }
        );

        return (response.data.news || []).map((item: any) => ({
          title: item.title,
          url: item.link,
          snippet: item.snippet,
          source: 'news',
          timestamp: item.date,
          relevance: 0.8,
        }));
      } catch (error) {
        console.error('News search error:', error);
        return [];
      }
    }

    return [];
  }

  /**
   * Search academic sources
   */
  private async searchAcademic(query: string): Promise<SearchResult[]> {
    // Use Semantic Scholar API (free, no API key needed)
    try {
      const response = await axios.get(
        'https://api.semanticscholar.org/graph/v1/paper/search',
        {
          params: {
            query,
            limit: 10,
            fields: 'title,abstract,url,year,authors',
          },
        }
      );

      return (response.data.data || []).map((paper: any) => ({
        title: paper.title,
        url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
        snippet: paper.abstract || 'No abstract available',
        source: 'academic',
        timestamp: paper.year?.toString(),
        relevance: 0.9,
        metadata: {
          authors: paper.authors?.map((a: any) => a.name).join(', '),
          year: paper.year,
        },
      }));
    } catch (error) {
      console.error('Academic search error:', error);
      return [];
    }
  }

  /**
   * Search with Brave Search API
   */
  private async searchWithBrave(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
        params: {
          q: query,
          count: 10,
        },
        headers: {
          'X-Subscription-Token': this.searchAPIs.brave,
          'Accept': 'application/json',
        },
      });

      return (response.data.web?.results || []).map((item: any) => ({
        title: item.title,
        url: item.url,
        snippet: item.description,
        source: 'web',
        relevance: 0.85,
      }));
    } catch (error) {
      console.error('Brave search error:', error);
      return [];
    }
  }

  /**
   * Search with Serper API
   */
  private async searchWithSerper(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.post(
        'https://google.serper.dev/search',
        {
          q: query,
          num: 10,
        },
        {
          headers: {
            'X-API-KEY': this.searchAPIs.serper,
            'Content-Type': 'application/json',
          },
        }
      );

      return (response.data.organic || []).map((item: any) => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        source: 'web',
        relevance: 0.85,
      }));
    } catch (error) {
      console.error('Serper search error:', error);
      return [];
    }
  }

  /**
   * Search with Tavily API
   */
  private async searchWithTavily(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.post(
        'https://api.tavily.com/search',
        {
          api_key: this.searchAPIs.tavily,
          query,
          search_depth: 'advanced',
          max_results: 10,
        }
      );

      return (response.data.results || []).map((item: any) => ({
        title: item.title,
        url: item.url,
        snippet: item.content,
        source: 'web',
        relevance: item.score || 0.85,
      }));
    } catch (error) {
      console.error('Tavily search error:', error);
      return [];
    }
  }

  /**
   * Rank results by relevance
   */
  private rankResults(results: SearchResult[], query: string): SearchResult[] {
    const queryTerms = query.toLowerCase().split(/\s+/);

    return results
      .map(result => {
        // Calculate relevance score
        const titleMatch = queryTerms.filter(term =>
          result.title.toLowerCase().includes(term)
        ).length;
        const snippetMatch = queryTerms.filter(term =>
          result.snippet.toLowerCase().includes(term)
        ).length;

        const score =
          (titleMatch * 2 + snippetMatch) / queryTerms.length +
          (result.relevance || 0.5);

        return { ...result, relevance: score };
      })
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
  }

  /**
   * AI-powered synthesis using Claude
   */
  private async synthesizeResults(
    query: string,
    results: SearchResult[]
  ): Promise<string> {
    const context = results
      .map(
        (r, i) =>
          `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.url}\n`
      )
      .join('\n');

    const prompt = `You are a research synthesizer. Analyze these search results and create a comprehensive, accurate answer to the query.

Query: ${query}

Search Results:
${context}

Provide a well-structured, informative synthesis that:
1. Directly answers the query
2. Combines information from multiple sources
3. Maintains accuracy and includes relevant details
4. Uses proper citations like [1], [2] etc.
5. Identifies any conflicting information
6. Highlights key insights and takeaways

Synthesis:`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = response.content.find(c => c.type === 'text');
      return textContent ? (textContent as any).text : 'Unable to synthesize results.';
    } catch (error) {
      console.error('Synthesis error:', error);
      return this.fallbackSynthesis(query, results);
    }
  }

  /**
   * Fallback synthesis without AI
   */
  private fallbackSynthesis(query: string, results: SearchResult[]): string {
    const topResults = results.slice(0, 5);
    let synthesis = `Research findings for "${query}":\n\n`;

    topResults.forEach((result, i) => {
      synthesis += `${i + 1}. ${result.title}\n${result.snippet}\n\n`;
    });

    return synthesis;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(results: SearchResult[]): number {
    if (results.length === 0) return 0;

    const avgRelevance =
      results.reduce((sum, r) => sum + (r.relevance || 0.5), 0) / results.length;
    const sourceCount = results.length;
    const diversityScore = new Set(results.map(r => r.source)).size / 4; // Assume 4 source types

    return Math.min(1, (avgRelevance + diversityScore) / 2) * Math.min(1, sourceCount / 10);
  }

  /**
   * Mock results for development
   */
  private getMockResults(query: string): SearchResult[] {
    return [
      {
        title: `Understanding ${query}`,
        url: 'https://example.com/1',
        snippet: `A comprehensive guide to ${query}. This covers the fundamentals and advanced concepts.`,
        source: 'web',
        relevance: 0.9,
      },
      {
        title: `${query} - Latest Research`,
        url: 'https://example.com/2',
        snippet: `Recent studies on ${query} show promising results in various applications.`,
        source: 'academic',
        relevance: 0.85,
      },
      {
        title: `How ${query} Works`,
        url: 'https://example.com/3',
        snippet: `An in-depth exploration of the mechanisms behind ${query}.`,
        source: 'web',
        relevance: 0.8,
      },
    ];
  }

  /**
   * Quick search (lighter version)
   */
  async quickSearch(query: string): Promise<SearchResult[]> {
    return await this.searchWeb(query);
  }

  /**
   * Get trending topics
   */
  async getTrendingTopics(): Promise<string[]> {
    // Could integrate with trending APIs
    return [
      'AI developments',
      'Web3 technology',
      'Climate change',
      'Space exploration',
      'Quantum computing',
    ];
  }
}
