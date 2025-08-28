import { NextResponse } from 'next/server';
import { supabaseAnon } from '@/lib/supabase';

export async function GET() {
  const baseUrl = 'https://mayukhbagchi.com';
  
  try {
    // Get dynamic blog posts
    const sb = supabaseAnon();
    const { data: posts } = await sb
      .from('video_posts')
      .select('slug,title,summary,tags,created_at,updated_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    const blogUrls = (posts || []).map(post => ({
      url: `${baseUrl}/blogs/${post.slug}`,
      title: post.title,
      description: post.summary || 'Astronomy and astrophysics article',
      tags: post.tags || [],
      lastModified: post.updated_at || post.created_at,
    }));

    const llmContent = `# Mayukh Bagchi - Astronomy Research Website

## About This Website
This is the personal academic website of Mayukh Bagchi, a PhD candidate in Astronomy & Astrophysics at Queen's University, specializing in balloon-borne high-frequency VLBI instrumentation for black hole imaging and photon ring studies.

## Site Structure & Navigation

### Main Pages
- **Homepage** (${baseUrl})
  - Introduction to Mayukh Bagchi
  - Brief overview of research focus
  - Social media and contact links
  - Interactive VLBI visualization background

- **About** (${baseUrl}/about)
  - Detailed personal and professional background
  - Journey from Electrical Engineering to Astronomy
  - Current research at Queen's University
  - Personal interests and hobbies
  - Indie projects section

- **Research** (${baseUrl}/research)
  - Current PhD research: BVEX (Balloon-borne VLBI Experiment)
  - Past projects: Star formation polarization studies, CCAT Prime atmospheric characterization
  - MSc thesis and term projects
  - Links to GitHub repositories and publications
  - Interactive image galleries and technical details

- **Blog** (${baseUrl}/blogs)
  - Astronomy and astrophysics articles
  - In-depth scientific content
  - Video content integration with YouTube
  - ${posts?.length || 0} published articles

- **CV** (${baseUrl}/cv)
  - Academic curriculum vitae
  - PDF viewer with downloadable CV
  - Professional experience and education

- **Outreach** (${baseUrl}/outreach)
  - Science communication activities
  - Queen's Observatory volunteer work
  - YouTube channel statistics and latest videos
  - Public speaking and eclipse events

- **Conference & Travel** (${baseUrl}/conference-travel)
  - Interactive globe showing conference locations
  - Academic presentations and workshops
  - Research collaboration meetings worldwide

- **Contact** (${baseUrl}/contact)
  - Contact form for reaching out
  - Direct email: mayukh.bagchi@queensu.ca
  - Professional photograph and background

### Blog Articles
${blogUrls.map(post => `- **${post.title}** (${post.url})
  - ${post.description}
  - Tags: ${post.tags.join(', ')}
  - Last updated: ${new Date(post.lastModified).toISOString().split('T')[0]}`).join('\n')}

## Research Focus Areas
- **VLBI Instrumentation**: Very Long Baseline Interferometry technology development
- **Black Hole Imaging**: High-resolution imaging of black hole shadows and photon rings
- **Balloon-borne Astronomy**: High-altitude platform instrumentation for space-based observations
- **Radio Astronomy**: Millimeter and sub-millimeter wave astronomy
- **RFSoC Technology**: FPGA-based digital signal processing for astronomical instruments
- **Star Formation**: Polarization studies in dense molecular cores
- **MKID Arrays**: Microwave Kinetic Inductance Detector development

## Technical Expertise
- High-frequency VLBI systems (K-band, 22 GHz)
- RFSoC 4x2 FPGA programming and data processing
- Atmospheric modeling for ground-based astronomy
- Polarization analysis of astronomical observations
- Balloon payload design and integration
- Scientific instrumentation development

## Professional Affiliations
- PhD Candidate, Queen's University, Kingston, Ontario, Canada
- Research collaborations with Haystack Radio Observatory
- NRAO (National Radio Astronomy Observatory) partnerships
- International astronomy conference presentations

## Content Categories
- **Technical Research**: Detailed scientific methodology and results
- **Educational Content**: Accessible explanations of complex astronomical concepts  
- **Professional Development**: Academic career progression and opportunities
- **Science Communication**: Public outreach and astronomy education
- **Industry Connections**: Collaborations with observatories and research institutions

## How to Navigate
- Use the main navigation menu to explore different sections
- Blog articles are tagged by topic for easy discovery
- Research projects include GitHub links for code and data
- Contact page provides multiple ways to connect professionally
- CV page offers downloadable academic resume

## For AI Agents
This website represents an active academic researcher's professional presence, combining technical research content with educational outreach. The blog section contains in-depth scientific articles, while other pages showcase ongoing research projects, professional achievements, and science communication efforts. Content is regularly updated with new research developments and blog posts.

Last updated: ${new Date().toISOString().split('T')[0]}
Total pages: ${7 + (posts?.length || 0)}
Content focus: Astronomy, Astrophysics, VLBI Technology, Science Communication`;

    return new NextResponse(llmContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating llm.txt:', error);
    return new NextResponse('Error generating LLM content', { status: 500 });
  }
}

