import React, { useEffect, useRef, useState } from 'react';

const PAGE_SIZES = {
  a4: { width: 794, height: 1123 },
  letter: { width: 816, height: 1056 },
};

const PREVIEW_TYPE_SCALE = 1.5;
const MIN_READABLE_SCALE = 0.46;
const SECTION_SPACING = {
  headingTop: '18px',
  headingBottom: '10px',
  ruleGap: '5px',
  itemGap: '14px',
  subtitleGap: '4px',
  bodyGap: '5px',
};
const scaleFont = (size) => `${Math.round(parseFloat(size) * PREVIEW_TYPE_SCALE * 10) / 10}px`;

const getPageSize = (pageFormat = 'letter') => PAGE_SIZES[pageFormat] || PAGE_SIZES.letter;

const basePage = {
  width: '100%',
  minHeight: '100%',
  height: 'auto',
  background: '#ffffff',
  color: '#0f172a',
  boxSizing: 'border-box',
  overflow: 'visible',
};

const splitName = (fullName = 'Your Name') => {
  const parts = fullName.trim().split(/\s+/);
  return {
    first: parts[0] || 'Your',
    last: parts.slice(1).join(' ') || 'Name',
  };
};

const LINKEDIN_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '9px', height: '9px', fill: 'currentColor', display: 'block' }}>
    <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A1.97 1.97 0 1 0 5.3 6.94 1.97 1.97 0 0 0 5.25 3ZM20.44 12.73c0-3.46-1.85-5.07-4.31-5.07-1.99 0-2.88 1.1-3.38 1.87V8.5H9.37c.04.68 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.68.12-.93.27-.68.88-1.38 1.9-1.38 1.34 0 1.88 1.03 1.88 2.54V20H20.44v-7.27Z" />
  </svg>
);

const GITHUB_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '9px', height: '9px', fill: 'currentColor', display: 'block' }}>
    <path d="M12 .5A11.5 11.5 0 0 0 .5 12.29c0 5.25 3.4 9.7 8.12 11.27.6.12.82-.26.82-.58 0-.28-.01-1.22-.02-2.2-3.3.74-4-1.43-4-1.43-.54-1.4-1.33-1.77-1.33-1.77-1.08-.76.08-.74.08-.74 1.2.09 1.83 1.26 1.83 1.26 1.06 1.87 2.8 1.33 3.48 1.02.1-.8.42-1.33.75-1.64-2.63-.31-5.4-1.35-5.4-6 0-1.32.46-2.4 1.22-3.24-.12-.31-.53-1.57.12-3.27 0 0 1-.33 3.3 1.24a11.2 11.2 0 0 1 6 0c2.3-1.57 3.3-1.24 3.3-1.24.65 1.7.24 2.96.12 3.27.76.84 1.22 1.92 1.22 3.24 0 4.66-2.78 5.68-5.43 5.98.43.38.81 1.1.81 2.22 0 1.61-.02 2.91-.02 3.3 0 .32.22.7.83.58A11.8 11.8 0 0 0 23.5 12.3 11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

const formatContact = (personalInfo) =>
  [
    personalInfo.phone,
    personalInfo.email,
    personalInfo.location,
    personalInfo.linkedin,
    personalInfo.website,
  ].filter(Boolean);

const formatHeaderContacts = (personalInfo = {}) =>
  [
    personalInfo.phone ? { value: personalInfo.phone, type: 'text' } : null,
    personalInfo.email ? { value: personalInfo.email, type: 'text' } : null,
    personalInfo.location ? { value: personalInfo.location, type: 'text' } : null,
    personalInfo.linkedin ? { value: personalInfo.linkedin, type: 'linkedin' } : null,
    personalInfo.website ? { value: personalInfo.website, type: /github\.com/i.test(personalInfo.website) ? 'github' : 'text' } : null,
  ].filter(Boolean);

const renderContactValue = (contact, index) => (
  <span
    key={`${contact.type}-${contact.value}-${index}`}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      color: '#111827',
    }}
  >
    {contact.type === 'linkedin' ? (
      <span
        style={{
          width: '13px',
          height: '13px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111827',
          color: '#ffffff',
          borderRadius: '2px',
          flexShrink: 0,
        }}
      >
        {LINKEDIN_ICON}
      </span>
    ) : null}
    {contact.type === 'github' ? (
      <span
        style={{
          width: '13px',
          height: '13px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#111827',
          flexShrink: 0,
        }}
      >
        {GITHUB_ICON}
      </span>
    ) : null}
    <span>{contact.value}</span>
  </span>
);

const renderHeaderContacts = (contacts, options = {}) => {
  const { justifyContent = 'center' } = options;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent,
        flexWrap: 'wrap',
        rowGap: '6px',
        columnGap: '0',
        alignItems: 'center',
      }}
    >
      {contacts.map((item, index) => (
        <React.Fragment key={`${item.type}-${item.value}-${index}`}>
          {index > 0 && (
            <span
              aria-hidden="true"
              style={{
                margin: '0 8px',
                color: '#94a3b8',
                fontWeight: 600,
              }}
            >
              |
            </span>
          )}
          {renderContactValue(item, index)}
        </React.Fragment>
      ))}
    </div>
  );
};

const firstSentence = (text = '') => {
  const normalizedText = `${text}`.trim();
  if (!normalizedText) return '';

  const [sentence] = normalizedText.split('.');
  return sentence.trim();
};

const sectionLabel = {
  summary: 'Summary',
  skills: 'Technical Skills',
  experience: 'Experience',
  education: 'Education',
  projects: 'Projects',
};

const AutoFitPage = ({ pageFormat = 'letter', children }) => {
  const { width, height } = getPageSize(pageFormat);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    const contentNode = contentRef.current;
    if (!contentNode) return;

    const updateScale = () => {
      const originalWidthStr = contentNode.style.width;
      
      contentNode.style.width = `${width}px`;
      const baseHeight = contentNode.scrollHeight;
      
      if (baseHeight <= height) {
        contentNode.style.width = originalWidthStr;
        setScale(1);
        setPageCount(1);
        return;
      }
      
      let low = MIN_READABLE_SCALE;
      let high = 1.0;
      let optimalScale = MIN_READABLE_SCALE;
      
      for (let i = 0; i < 9; i++) {
        let mid = (low + high) / 2;
        contentNode.style.width = `${width / mid}px`;
        if (contentNode.scrollHeight * mid <= height) {
          optimalScale = mid;
          low = mid; 
        } else {
          high = mid;
        }
      }
      
      contentNode.style.width = `${width / optimalScale}px`;
      const finalHeight = contentNode.scrollHeight;
      contentNode.style.width = originalWidthStr;
      
      let nextPageCount = 1;
      if (Math.abs(optimalScale - MIN_READABLE_SCALE) < 0.01 && finalHeight * optimalScale > height) {
        nextPageCount = Math.max(1, Math.ceil((finalHeight * optimalScale) / height));
      }
      
      setScale((prev) => (Math.abs(prev - optimalScale) < 0.01 ? prev : optimalScale));
      setPageCount((prev) => (prev === nextPageCount ? prev : nextPageCount));
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(contentNode);
    window.addEventListener('resize', updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [children, width, height]);

  return (
    <div
      style={{
        position: 'relative',
        width: `${width}px`,
        minHeight: `${height}px`,
        height: `${height * pageCount}px`,
        overflow: 'hidden',
        background: '#ffffff',
      }}
    >
      {Array.from({ length: pageCount }).map((_, index) => (
        <div
          key={`page-shell-${index}`}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: `${index * height}px`,
            left: 0,
            width: `${width}px`,
            height: `${height}px`,
            background: '#ffffff',
            boxShadow: index === 0 ? 'none' : 'inset 0 1px 0 #e2e8f0',
            pointerEvents: 'none',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <div
          ref={contentRef}
          style={{
            width: `${width / scale}px`,
            minHeight: `${height / scale}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            flexShrink: 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const SectionHeading = ({ children, color = '#111827', ruleColor = '#d1d5db', align = 'left', serif = false }) => (
  <div style={{ marginTop: serif ? '20px' : SECTION_SPACING.headingTop, marginBottom: serif ? '11px' : SECTION_SPACING.headingBottom, textAlign: align }}>
    <div
      style={{
        fontSize: serif ? scaleFont('12.5px') : scaleFont('11px'),
        fontWeight: 800,
        letterSpacing: serif ? '0.16em' : '0.18em',
        textTransform: 'uppercase',
        color,
        fontFamily: serif ? 'Georgia, serif' : 'inherit',
      }}
    >
      {children}
    </div>
    <div style={{ marginTop: SECTION_SPACING.ruleGap, height: '1px', background: ruleColor }} />
  </div>
);

const splitDescriptionIntoBullets = (text = '') =>
  `${text}`
    .split(/\n+|(?<=[.!?])\s+(?=[A-Z])|;\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

const DescriptionBlock = ({ text, color = '#374151' }) => {
  const bullets = splitDescriptionIntoBullets(text);
  if (bullets.length === 0) return null;

  return (
    <div style={{ marginTop: SECTION_SPACING.bodyGap }}>
      {bullets.map((bullet, index) => (
        <div
          key={`${bullet}-${index}`}
          style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'flex-start',
            fontSize: scaleFont('8.15px'),
            color,
            lineHeight: 1.55,
            marginTop: index === 0 ? 0 : '3px',
          }}
        >
          <span style={{ color: '#94a3b8', fontWeight: 700, lineHeight: 1.5 }}>•</span>
          <span>{bullet}</span>
        </div>
      ))}
    </div>
  );
};

const TimelineItem = ({ title, subtitle, meta, body, accent = '#1d4ed8', serif = false, bodyAsBullets = false }) => (
  <div style={{ marginBottom: SECTION_SPACING.itemGap }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'baseline' }}>
      <div
        style={{
          fontSize: scaleFont('9.6px'),
          fontWeight: 700,
          color: '#111827',
          fontFamily: serif ? 'Georgia, serif' : 'inherit',
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: scaleFont('7.8px'), color: '#6b7280', whiteSpace: 'nowrap' }}>{meta}</div>
    </div>
    {subtitle && (
      <div
        style={{
          fontSize: scaleFont('8.2px'),
          color: accent,
          marginTop: SECTION_SPACING.subtitleGap,
          fontStyle: serif ? 'italic' : 'normal',
        }}
      >
        {subtitle}
      </div>
    )}
    {body && (bodyAsBullets ? <DescriptionBlock text={body} /> : (
      <div style={{ fontSize: scaleFont('8.15px'), color: '#374151', lineHeight: 1.55, marginTop: SECTION_SPACING.bodyGap }}>
        {body}
      </div>
    ))}
  </div>
);

const CompactList = ({ items, color = '#111827', bullet = '-', columns = 1 }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: columns === 2 ? '1fr 1fr' : '1fr',
      gap: '4px 10px',
      fontSize: scaleFont('8px'),
      color,
      lineHeight: 1.45,
    }}
  >
    {items.map((item, index) => (
      <div key={`${item}-${index}`} style={{ display: 'flex', gap: '4px' }}>
        <span>{bullet}</span>
        <span>{item}</span>
      </div>
    ))}
  </div>
);

const renderDefaultTemplate = ({ data, accent = '#2563eb', fontFamily = 'Arial, sans-serif', headerStyle = 'centered', titleCase = 'uppercase' }) => {
  const { personalInfo, experience, education, skills, projects } = data;
  const contacts = formatHeaderContacts(personalInfo);

  return (
    <div style={{ ...basePage, padding: '48px 48px', fontFamily }}>
      <div style={{ textAlign: headerStyle === 'left' ? 'left' : 'center' }}>
        <div
          style={{
            fontSize: '22px',
            fontWeight: 900,
            textTransform: titleCase,
            letterSpacing: headerStyle === 'left' ? '0.02em' : '0.08em',
            color: '#111827',
          }}
        >
          {personalInfo.fullName || 'Your Name'}
        </div>
        <div
          style={{
            marginTop: '5px',
            fontSize: scaleFont('8px'),
            color: '#4b5563',
          }}
        >
          {renderHeaderContacts(contacts, {
            justifyContent: headerStyle === 'left' ? 'flex-start' : 'center',
          })}
        </div>
      </div>

      {personalInfo.summary && (
        <>
          <SectionHeading color={accent} ruleColor={`${accent}33`}>
            {sectionLabel.summary}
          </SectionHeading>
          <div style={{ fontSize: scaleFont('8.3px'), lineHeight: 1.58, color: '#374151', marginBottom: '2px' }}>{personalInfo.summary}</div>
        </>
      )}

      {skills.length > 0 && (
        <>
          <SectionHeading color={accent} ruleColor={`${accent}33`}>
            {sectionLabel.skills}
          </SectionHeading>
          <div style={{ fontSize: scaleFont('8.2px'), color: '#1f2937', lineHeight: 1.56, marginBottom: '2px' }}>{skills.slice(0, 10).join(' | ')}</div>
        </>
      )}

      {experience.some((item) => item.company) && (
        <>
          <SectionHeading color={accent} ruleColor={`${accent}33`}>
            {sectionLabel.experience}
          </SectionHeading>
          {experience.slice(0, 2).map((item) => (
            <TimelineItem
              key={item.id}
              title={item.position}
              subtitle={item.company}
              meta={`${item.startDate} - ${item.endDate}`}
              body={item.description}
              bodyAsBullets
              accent={accent}
            />
          ))}
        </>
      )}

      {projects.some((item) => item.name) && (
        <>
          <SectionHeading color={accent} ruleColor={`${accent}33`}>
            {sectionLabel.projects}
          </SectionHeading>
          {projects.slice(0, 2).map((item) => (
            <TimelineItem
              key={item.id}
              title={item.name}
              subtitle={item.technologies}
              meta=""
              body={item.description}
              bodyAsBullets
              accent={accent}
            />
          ))}
        </>
      )}

      {education.some((item) => item.school) && (
        <>
          <SectionHeading color={accent} ruleColor={`${accent}33`}>
            {sectionLabel.education}
          </SectionHeading>
          {education.slice(0, 2).map((item) => (
            <TimelineItem
              key={item.id}
              title={item.school}
              subtitle={item.degree}
              meta={`${item.startDate} - ${item.endDate}`}
              body={item.description}
              accent={accent}
            />
          ))}
        </>
      )}
    </div>
  );
};

const renderDataScienceTemplate = ({ data }) => {
  const { personalInfo, experience, education, skills, projects } = data;
  const contacts = formatHeaderContacts(personalInfo);

  return (
    <div style={{ ...basePage, padding: '48px 48px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '10px' }}>
        <div style={{ fontSize: '22px', fontWeight: 800 }}>{personalInfo.fullName || 'Your Name'}</div>
        <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#0f172a', marginTop: '2px' }}>Data Scientist</div>
        <div style={{ fontSize: scaleFont('8px'), color: '#4b5563', marginTop: '6px' }}>
          {renderHeaderContacts(contacts, { justifyContent: 'center' })}
        </div>
      </div>

      {personalInfo.summary && (
        <>
          <SectionHeading color="#0284c7" ruleColor="#bae6fd">{'Objective'}</SectionHeading>
          <div style={{ fontSize: scaleFont('8.3px'), lineHeight: 1.56, color: '#374151' }}>{personalInfo.summary}</div>
        </>
      )}

      <SectionHeading color="#0284c7" ruleColor="#bae6fd">{'Skills'}</SectionHeading>
      <div style={{ display: 'grid', gridTemplateColumns: '114px 1fr', gap: '8px', fontSize: scaleFont('8px'), color: '#1f2937', lineHeight: 1.5 }}>
        <div style={{ fontWeight: 700 }}>Technical Skills</div>
        <div>{skills.slice(0, Math.ceil(skills.length / 2)).join(', ')}</div>
        <div style={{ fontWeight: 700 }}>Additional Skills</div>
        <div>{skills.slice(Math.ceil(skills.length / 2)).join(', ')}</div>
      </div>

      <SectionHeading color="#0284c7" ruleColor="#bae6fd">{'Technical Experience'}</SectionHeading>
      {experience.slice(0, 2).map((item) => (
        <div key={item.id} style={{ marginBottom: '9px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ fontSize: scaleFont('9px'), fontWeight: 700 }}>{item.position}</div>
            <div style={{ fontSize: scaleFont('7.8px'), color: '#6b7280' }}>{item.startDate} - {item.endDate}</div>
          </div>
          <div style={{ fontSize: scaleFont('8px'), fontStyle: 'italic', color: '#111827' }}>{item.company}</div>
          <DescriptionBlock text={item.description} />
        </div>
      ))}

      {projects.some((item) => item.name) && (
        <>
          <SectionHeading color="#0284c7" ruleColor="#bae6fd">{'Projects'}</SectionHeading>
          {projects.slice(0, 2).map((item) => (
            <div key={item.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ fontSize: scaleFont('9px'), fontWeight: 700 }}>{item.name}</div>
                <div style={{ fontSize: scaleFont('7.8px'), fontStyle: 'italic', color: '#0284c7' }}>{item.technologies}</div>
              </div>
              <DescriptionBlock text={item.description} />
            </div>
          ))}
        </>
      )}

      <SectionHeading color="#0284c7" ruleColor="#bae6fd">{'Education'}</SectionHeading>
      {education.slice(0, 2).map((item) => (
        <div key={item.id} style={{ marginBottom: '7px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ fontSize: scaleFont('9px'), fontWeight: 700 }}>{item.degree}</div>
            <div style={{ fontSize: scaleFont('7.8px'), color: '#6b7280' }}>{item.startDate} - {item.endDate}</div>
          </div>
          <div style={{ fontSize: scaleFont('8px'), fontStyle: 'italic', color: '#374151' }}>{item.school}</div>
          {item.description && (
            <div style={{ fontSize: scaleFont('8px'), color: '#374151', lineHeight: 1.5, marginTop: '3px' }}>{item.description}</div>
          )}
        </div>
      ))}
    </div>
  );
};

const renderResearcherCvTemplate = ({ data }) => {
  const { personalInfo, education, experience, projects, skills } = data;
  const { first, last } = splitName(personalInfo.fullName);
  const contacts = formatHeaderContacts(personalInfo);

  return (
    <div style={{ ...basePage, padding: '48px 48px', fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '36px', fontWeight: 400, color: '#2563eb', lineHeight: 0.98 }}>
            {first}
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#2563eb', lineHeight: 1.03 }}>
            {last}
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#4b5563' }}>Researcher</div>
        </div>
        <div style={{ fontSize: scaleFont('8.6px'), color: '#4b5563', textAlign: 'right', lineHeight: 1.56 }}>
          {contacts.map((item, index) => (
            <div key={`${item.type}-${item.value}-${index}`} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2px' }}>
              {renderContactValue(item, index)}
            </div>
          ))}
        </div>
      </div>

      {personalInfo.summary && (
        <>
          <SectionHeading color="#2563eb" ruleColor="#bfdbfe" serif>
            {'Professional Summary'}
          </SectionHeading>
          <div style={{ fontSize: scaleFont('9.2px'), lineHeight: 1.6, color: '#374151' }}>{personalInfo.summary}</div>
        </>
      )}

      <SectionHeading color="#2563eb" ruleColor="#bfdbfe" serif>{'Education'}</SectionHeading>
      {education.slice(0, 2).map((item) => (
        <div key={item.id} style={{ marginBottom: '11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline' }}>
            <div style={{ fontSize: scaleFont('9.5px'), fontWeight: 700 }}>{item.degree}</div>
            <div style={{ fontSize: scaleFont('8.4px'), color: '#6b7280', whiteSpace: 'nowrap', textAlign: 'right' }}>
              {[item.startDate, item.endDate].filter(Boolean).join(' - ')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: scaleFont('8.6px'), color: '#4b5563' }}>{item.school}</div>
            {item.description && (
              <div style={{ fontSize: scaleFont('8.5px'), color: '#374151', lineHeight: 1.5, marginTop: '3px' }}>
                {item.description}
              </div>
            )}
          </div>
        </div>
      ))}

      <SectionHeading color="#2563eb" ruleColor="#bfdbfe" serif>{'Research Experience'}</SectionHeading>
      {experience.slice(0, 2).map((item) => (
        <div key={item.id} style={{ marginBottom: '11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline' }}>
            <div style={{ fontSize: scaleFont('9.5px'), fontWeight: 700 }}>{item.position}</div>
            <div style={{ fontSize: scaleFont('8.4px'), color: '#6b7280', whiteSpace: 'nowrap', textAlign: 'right' }}>
              {[item.startDate, item.endDate].filter(Boolean).join(' - ')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: scaleFont('8.6px'), color: '#2563eb' }}>{item.company}</div>
            <DescriptionBlock text={item.description} />
          </div>
        </div>
      ))}

      <SectionHeading color="#2563eb" ruleColor="#bfdbfe" serif>{'Publications & Projects'}</SectionHeading>
      {projects.slice(0, 2).map((item) => (
        <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '68px 1fr', gap: '10px', marginBottom: '8px' }}>
          <div style={{ fontSize: scaleFont('8.4px'), color: '#6b7280' }}>{item.technologies}</div>
          <div style={{ fontSize: scaleFont('8.7px'), color: '#374151', lineHeight: 1.54 }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>{item.name}.</span> {item.description}
          </div>
        </div>
      ))}

      <SectionHeading color="#2563eb" ruleColor="#bfdbfe" serif>{'Skills'}</SectionHeading>
      <div style={{ fontSize: scaleFont('8.7px'), color: '#374151', lineHeight: 1.54 }}>{skills.join(', ')}</div>
    </div>
  );
};

const renderModularCvTemplate = ({ data }) => {
  const { personalInfo, education, experience, projects, skills } = data;
  const contacts = formatHeaderContacts(personalInfo);

  return (
    <div style={{ ...basePage, padding: '48px 48px', fontFamily: 'Charter, Georgia, serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '21px', fontWeight: 700 }}>{personalInfo.fullName || 'Full Name'}</div>
        <div style={{ fontSize: scaleFont('8px'), color: '#4b5563', marginTop: '5px' }}>
          {renderHeaderContacts(contacts, { justifyContent: 'center' })}
        </div>
      </div>
      <div style={{ height: '1px', background: '#111827', marginTop: '10px' }} />

      {personalInfo.summary && (
        <>
          <SectionHeading color="#111827" ruleColor="#d1d5db" serif>{'Profile'}</SectionHeading>
          <div style={{ fontSize: scaleFont('8.2px'), color: '#374151', lineHeight: 1.56 }}>{personalInfo.summary}</div>
        </>
      )}

      <SectionHeading color="#111827" ruleColor="#d1d5db" serif>{'Education'}</SectionHeading>
      {education.slice(0, 2).map((item) => (
        <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '82px 1fr', gap: '10px', marginBottom: '9px' }}>
          <div style={{ fontSize: scaleFont('8px'), fontWeight: 700 }}>{item.startDate}</div>
          <div>
            <div style={{ fontSize: scaleFont('9px'), fontWeight: 700 }}>{item.degree}</div>
            <div style={{ fontSize: scaleFont('8px'), fontStyle: 'italic', color: '#4b5563' }}>{item.school}</div>
            {item.description && (
              <div style={{ fontSize: scaleFont('8px'), lineHeight: 1.5, color: '#374151', marginTop: '3px' }}>{item.description}</div>
            )}
          </div>
        </div>
      ))}

      <SectionHeading color="#111827" ruleColor="#d1d5db" serif>{'Professional Experience'}</SectionHeading>
      {experience.slice(0, 2).map((item) => (
        <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '82px 1fr', gap: '10px', marginBottom: '9px' }}>
          <div style={{ fontSize: scaleFont('8px'), fontWeight: 700 }}>{item.startDate}</div>
          <div>
            <div style={{ fontSize: scaleFont('9px'), fontWeight: 700 }}>{item.position}</div>
            <div style={{ fontSize: scaleFont('8px'), fontStyle: 'italic', color: '#4b5563' }}>{item.company}</div>
            <DescriptionBlock text={item.description} />
          </div>
        </div>
      ))}

      <SectionHeading color="#111827" ruleColor="#d1d5db" serif>{'Research & Projects'}</SectionHeading>
      <CompactList items={projects.slice(0, 2).map((item) => `${item.name}: ${item.description}`)} color="#374151" bullet="-" />

      <SectionHeading color="#111827" ruleColor="#d1d5db" serif>{'Skills'}</SectionHeading>
      <div style={{ fontSize: scaleFont('8px'), color: '#374151', lineHeight: 1.5 }}>{skills.join(' | ')}</div>
    </div>
  );
};

const renderSfiucrTemplate = ({ data }) => {
  const { personalInfo, education, experience, projects, skills } = data;

  return (
    <div style={{ ...basePage, padding: '48px 48px', fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'start' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>{personalInfo.fullName || 'Your Name'}</div>
        <div style={{ fontSize: '7.8px', color: '#4b5563', textAlign: 'right', lineHeight: 1.5 }}>
          {personalInfo.email && <div>Email: {personalInfo.email}</div>}
          {personalInfo.phone && <div>Mobile: {personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
        </div>
      </div>

      <SectionHeading color="#111827" ruleColor="#111827" serif>{'Education'}</SectionHeading>
      {education.slice(0, 2).map((item) => (
        <TimelineItem
          key={item.id}
          title={item.school}
          subtitle={item.degree}
          meta={`${item.startDate} - ${item.endDate}`}
          body={item.description}
          bodyAsBullets
          accent="#4b5563"
          serif
        />
      ))}

      <SectionHeading color="#111827" ruleColor="#111827" serif>{'Skills Summary'}</SectionHeading>
      <div style={{ fontSize: '8px', color: '#374151', lineHeight: 1.45 }}>
        <strong>Technical Skills:</strong> {skills.slice(0, Math.ceil(skills.length / 2)).join(', ')}
      </div>
      {skills.length > 2 && (
        <div style={{ fontSize: '8px', color: '#374151', lineHeight: 1.45, marginTop: '4px' }}>
          <strong>Tools & Platforms:</strong> {skills.slice(Math.ceil(skills.length / 2)).join(', ')}
        </div>
      )}

      <SectionHeading color="#111827" ruleColor="#111827" serif>{'Experience'}</SectionHeading>
      {experience.slice(0, 2).map((item) => (
        <TimelineItem
          key={item.id}
          title={item.company}
          subtitle={item.position}
          meta={`${item.startDate} - ${item.endDate}`}
          body={item.description}
          accent="#4b5563"
          serif
        />
      ))}

      <SectionHeading color="#111827" ruleColor="#111827" serif>{'Projects'}</SectionHeading>
      <CompactList
        items={projects.slice(0, 2).map((item) => `${item.name} (${item.technologies}): ${item.description}`)}
        color="#374151"
        bullet="-"
      />
    </div>
  );
};

const renderModernSimpleTemplate = ({ data }) => {
  const { personalInfo, education, experience, projects, skills } = data;
  const { first, last } = splitName(personalInfo.fullName);
  const contacts = formatHeaderContacts(personalInfo);

  return (
    <div style={{ ...basePage, padding: '48px 48px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
        {first} <span style={{ color: '#6b7280' }}>{last}</span>
      </div>
      <div style={{ marginTop: '6px', fontSize: scaleFont('8px'), color: '#4b5563' }}>
        {renderHeaderContacts(contacts, { justifyContent: 'flex-start' })}
      </div>
      <div style={{ height: '2px', background: '#111827', marginTop: '8px' }} />

      {personalInfo.summary && (
        <>
          <SectionHeading color="#111827" ruleColor="#d1d5db">{'Profile'}</SectionHeading>
          <div style={{ fontSize: scaleFont('8.2px'), color: '#374151', lineHeight: 1.5 }}>{personalInfo.summary}</div>
        </>
      )}

      <SectionHeading color="#111827" ruleColor="#d1d5db">{'Professional Experience'}</SectionHeading>
      {experience.slice(0, 2).map((item) => (
        <TimelineItem
          key={item.id}
          title={item.position}
          subtitle={item.company}
          meta={`${item.startDate} - ${item.endDate}`}
          body={item.description}
          bodyAsBullets
          accent="#111827"
        />
      ))}

      <SectionHeading color="#111827" ruleColor="#d1d5db">{'Projects'}</SectionHeading>
      {projects.slice(0, 2).map((item) => (
        <TimelineItem
          key={item.id}
          title={item.name}
          subtitle={item.technologies}
          meta=""
          body={item.description}
          accent="#111827"
        />
      ))}

      <SectionHeading color="#111827" ruleColor="#d1d5db">{'Education'}</SectionHeading>
      {education.slice(0, 2).map((item) => (
        <TimelineItem
          key={item.id}
          title={item.degree}
          subtitle={item.school}
          meta={`${item.startDate} - ${item.endDate}`}
          body={item.description}
          accent="#111827"
        />
      ))}

      <SectionHeading color="#111827" ruleColor="#d1d5db">{'Skills'}</SectionHeading>
      <CompactList items={skills.slice(0, 8)} color="#374151" bullet="-" columns={2} />
    </div>
  );
};

const renderAltaCvTemplate = ({ data }) => {
  const {
    personalInfo = {},
    education = [],
    experience = [],
    projects = [],
    skills = [],
  } = data || {};
  const summaryTagline = firstSentence(personalInfo.summary) || 'Your Title';

  return (
    <div style={{ ...basePage, padding: '0', fontFamily: 'Arial, sans-serif', display: 'flex' }}>
      <div style={{ width: '34%', background: '#f8fafc', borderRight: '1px solid #e5e7eb', padding: '48px 48px' }}>
        <div style={{ fontSize: '19px', fontWeight: 800, color: '#450808', lineHeight: 1.1 }}>{personalInfo.fullName || 'Your Name'}</div>
        <div style={{ fontSize: scaleFont('8px'), color: '#8f0d0d', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '6px' }}>
          {summaryTagline}
        </div>

        <SectionHeading color="#450808" ruleColor="#e7d192">{'Contact'}</SectionHeading>
        <CompactList items={formatContact(personalInfo).slice(0, 4)} color="#475569" bullet="-" />

        <SectionHeading color="#450808" ruleColor="#e7d192">{'Education'}</SectionHeading>
        {education.slice(0, 2).map((item) => (
          <div key={item.id} style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: scaleFont('8.5px'), fontWeight: 700, color: '#111827' }}>{item.degree}</div>
            <div style={{ fontSize: scaleFont('8px'), color: '#475569' }}>{item.school}</div>
            <div style={{ fontSize: scaleFont('7.8px'), color: '#94a3b8' }}>{item.startDate} - {item.endDate}</div>
            {item.description && (
              <div style={{ fontSize: scaleFont('8px'), lineHeight: 1.5, color: '#475569', marginTop: '3px' }}>{item.description}</div>
            )}
          </div>
        ))}

        <SectionHeading color="#450808" ruleColor="#e7d192">{'Skills'}</SectionHeading>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {skills.slice(0, 8).map((item, index) => (
            <span
              key={`${item}-${index}`}
              style={{
                fontSize: scaleFont('7.6px'),
                padding: '3px 6px',
                borderRadius: '999px',
                background: '#fff7ed',
                color: '#8f0d0d',
                border: '1px solid #fed7aa',
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '48px 48px' }}>
        <SectionHeading color="#450808" ruleColor="#e7d192">{'Experience'}</SectionHeading>
        {experience.slice(0, 2).map((item) => (
          <div key={item.id} style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: scaleFont('9.5px'), fontWeight: 700 }}>{item.position}</div>
            <div style={{ fontSize: scaleFont('8px'), color: '#8f0d0d', marginTop: '1px' }}>
              {item.company} | {item.startDate} - {item.endDate}
            </div>
            <DescriptionBlock text={item.description} color="#475569" />
          </div>
        ))}

        <SectionHeading color="#450808" ruleColor="#e7d192">{'Projects'}</SectionHeading>
        {projects.slice(0, 2).map((item) => (
          <div key={item.id} style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: scaleFont('9.2px'), fontWeight: 700 }}>{item.name}</div>
            <div style={{ fontSize: scaleFont('8px'), color: '#8f0d0d' }}>{item.technologies}</div>
            <DescriptionBlock text={item.description} color="#475569" />
          </div>
        ))}

        <SectionHeading color="#450808" ruleColor="#e7d192">{'About Me'}</SectionHeading>
        <div style={{ fontSize: scaleFont('8.1px'), color: '#475569', lineHeight: 1.56 }}>{personalInfo.summary}</div>
      </div>
    </div>
  );
};

export const UniversalPreview = ({ data, template }) => {
  const previewMode = template?.previewMode || 'jakes';
  const pageFormat = template?.pageFormat || 'letter';

  let previewContent;

  switch (previewMode) {
    case 'atsTechnical':
      previewContent = renderDefaultTemplate({
        data,
        accent: '#2563eb',
        fontFamily: 'Roboto, Arial, sans-serif',
        headerStyle: 'centered',
        titleCase: 'uppercase',
      });
      break;
    case 'swe':
      previewContent = renderDefaultTemplate({
        data,
        accent: '#111827',
        fontFamily: 'Lato, Arial, sans-serif',
        headerStyle: 'centered',
        titleCase: 'uppercase',
      });
      break;
    case 'dataScience':
      previewContent = renderDataScienceTemplate({ data });
      break;
    case 'researcherCv':
      previewContent = renderResearcherCvTemplate({ data });
      break;
    case 'modularCv':
      previewContent = renderModularCvTemplate({ data });
      break;
    case 'sfiucrCv':
      previewContent = renderSfiucrTemplate({ data });
      break;
    case 'modernSimple':
      previewContent = renderModernSimpleTemplate({ data });
      break;
    case 'altacv':
      previewContent = renderAltaCvTemplate({ data });
      break;
    case 'jakes':
    default:
      previewContent = renderDefaultTemplate({
        data,
        accent: '#111827',
        fontFamily: 'Arial, sans-serif',
        headerStyle: 'centered',
        titleCase: 'uppercase',
      });
      break;
  }

  return <AutoFitPage pageFormat={pageFormat}>{previewContent}</AutoFitPage>;
};

export { getPageSize };
