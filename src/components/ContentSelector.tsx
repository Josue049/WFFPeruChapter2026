import { useState } from 'react';
import './Styles/ContentSelector.css';

interface ContentItem {
  id: number;
  title: string;
  description: string;
  fullText: string;
  image: string;
  thumbnail: string;
}

const contentData: ContentItem[] = [
  {
    id: 1,
    title: 'Modern Development',
    description: 'Explore the latest in modern web development with cutting-edge tools and frameworks. Build scalable, performant applications that delight users and drive business growth.',
    fullText: 'Modern web development has revolutionized the way we build applications. With frameworks like React, Vue, and Angular, developers can create highly interactive and responsive user interfaces that provide exceptional user experiences.\n\nThe ecosystem has evolved to include powerful tools for state management, routing, and server-side rendering. TypeScript has become the standard for type-safe development, catching errors before they reach production.\n\nModern build tools like Vite and esbuild have dramatically improved development experience with lightning-fast hot module replacement and optimized production builds. Component-based architecture promotes reusability and maintainability.\n\nPerformance optimization techniques such as code splitting, lazy loading, and tree shaking ensure that applications load quickly and run smoothly even on slower networks and devices.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    title: 'Creative Design',
    description: 'Discover innovative design patterns and visual concepts that push boundaries. From abstract art to functional interfaces, creativity knows no limits.',
    fullText: 'Creative design is the intersection of art and functionality. It\'s about pushing boundaries while maintaining usability and accessibility. Modern design systems combine aesthetic beauty with practical purpose.\n\nColor theory, typography, and spatial relationships work together to create harmonious interfaces that guide users naturally through their journey. Animation and micro-interactions add personality and provide valuable feedback.\n\nAccessibility is not an afterthought but a fundamental principle. Designing for everyone means considering diverse needs, abilities, and contexts. High contrast ratios, clear typography, and logical navigation structures benefit all users.\n\nDesign tools have evolved to support collaborative workflows, allowing designers and developers to work seamlessly together. Component libraries and design tokens ensure consistency across products.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    title: 'Innovation Space',
    description: 'Transform your workspace into a hub of creativity and innovation. Collaborate with talented teams to bring groundbreaking ideas to life in a dynamic environment.',
    fullText: 'Innovation spaces are designed to foster creativity and collaboration. These environments break down traditional barriers and encourage cross-functional teamwork. Open layouts promote spontaneous conversations and idea sharing.\n\nThe physical space influences how teams work together. Natural light, comfortable seating, and flexible furniture arrangements support different work styles. Quiet zones for focused work coexist with collaborative areas for group activities.\n\nTechnology integration is seamless, with tools for virtual collaboration, digital whiteboards, and presentation systems. Hybrid work models are supported with spaces designed for both in-person and remote participation.\n\nCulture and community are built through shared spaces. Coffee stations, lounges, and recreational areas encourage informal interactions that often lead to breakthrough ideas. The workspace becomes more than a place to work—it becomes a place to innovate.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop',
    thumbnail: './img/LogoDataAgro5.png'
  }
];

const ContentSelector = () => {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [isTextMode, setIsTextMode] = useState<boolean>(false);
  
  const selectedContent = contentData.find(item => item.id === selectedId) || contentData[0];

  const handleSelectContent = (id: number) => {
    setSelectedId(id);
    setIsTextMode(false); // Reset to image mode when changing content
  };

  const toggleTextMode = () => {
    setIsTextMode(!isTextMode);
  };

  return (
    <div className="cs-wrapper-main">
      <div className="cs-layout-grid">
        {/* Sidebar con thumbnails */}
        <div className="cs-thumbs-rail">
          {contentData.map((item) => (
            <div
              key={item.id}
              className={`cs-thumb-card ${selectedId === item.id ? 'cs-thumb-active' : ''}`}
              onClick={() => handleSelectContent(item.id)}
            >
              <img src={item.thumbnail} alt={item.title} />
              <div className="cs-thumb-shade"></div>
            </div>
          ))}
        </div>

        {/* Contenido principal */}
        <div className={`cs-hero-panel ${isTextMode ? 'cs-text-mode' : ''}`}>
          {!isTextMode && (
            <div className="cs-bg-layer">
              <img src={selectedContent.image} alt={selectedContent.title} />
              <div className="cs-bottom-gradient"></div>
            </div>
          )}
          
          <div className={`cs-text-zone ${isTextMode ? 'cs-full-text' : ''}`}>
            <button className="cs-action-badge" onClick={toggleTextMode}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                {isTextMode ? (
                  <>
                    <path d="M1 6L1 3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1L13 1C13.5304 1 14.0391 1.21071 14.4142 1.58579C14.7893 1.96086 15 2.46957 15 3V13C15 13.5304 14.7893 14.0391 14.4142 14.4142C14.0391 14.7893 13.5304 15 13 15H3C2.46957 15 1.96086 14.7893 1.58579 14.4142C1.21071 14.0391 1 13.5304 1 13V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="5.5" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M15 9L11 5L1 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </>
                ) : (
                  <>
                    <path d="M14 9V13C14 13.5304 13.7893 14.0391 13.4142 14.4142C13.0391 14.7893 12.5304 15 12 15H3C2.46957 15 1.96086 14.7893 1.58579 14.4142C1.21071 14.0391 1 13.5304 1 13V4C1 3.46957 1.21071 2.96086 1.58579 2.58579C1.96086 2.21071 2.46957 2 3 2H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11 1H15V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.5 9.5L15 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </>
                )}
              </svg>
              {isTextMode ? 'Ver imagen' : 'Ver texto'}
            </button>
            
            {isTextMode ? (
              <div className="cs-text-content">
                <h1 className="cs-heading-xl">{selectedContent.title}</h1>
                <div className="cs-full-description">
                  {selectedContent.fullText.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <h1 className="cs-heading-xl">{selectedContent.title}</h1>
                <p className="cs-body-lead">{selectedContent.description}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentSelector;