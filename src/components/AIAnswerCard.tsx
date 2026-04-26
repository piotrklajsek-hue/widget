import { Star } from 'lucide-react';
import { FaInstagram, FaTiktok } from 'react-icons/fa';
import { motion } from 'motion/react';

export interface ServiceItem {
  name: string;
  price: string;
}

export interface AIAnswerData {
  headline: string;
  category: string;
  services: ServiceItem[];
  technologies: string;
  support: string;
  timeline?: string;
  recommendation?: {
    avatar: string;
    name: string;
    city: string;
    opinion: string;
    instagramPosts?: {
      id: string;
      imageUrl: string;
      postUrl: string;
      type: 'image' | 'video';
    }[];
    tiktokPosts?: {
      id: string;
      imageUrl: string;
      postUrl: string;
      type: 'image' | 'video';
    }[];
  };
}

export interface WebSearchSource {
  title: string;
  url: string;
  snippet: string;
  relevance: number;
}

export interface FollowUpQuestion {
  id: string;
  text: string;
  category: string;
}

interface AIAnswerCardProps {
  data: AIAnswerData;
  timestamp: string;
  sources?: WebSearchSource[];
  followUpQuestions?: FollowUpQuestion[];
  onCtaClick?: (action: 'quote' | 'portfolio' | 'contact') => void;
  onFollowUpClick?: (question: string) => void;
}

export function AIAnswerCard({ data, timestamp, followUpQuestions, onCtaClick, onFollowUpClick }: AIAnswerCardProps) {
  return (
    <div className="w-full">
        
        {/* ── 1. Headline / Summary ── always visible */}
        <div className="pr-5 pt-1 pb-3">
          <p className="text-white/90 text-sm leading-relaxed">
            {data.headline}
          </p>
        </div>

        {/* ── 2. Recommendation ── always visible, right under headline */}
        {data.recommendation && (
            <div className="mr-5 my-3" style={{ border: '1px solid #323334', borderRadius: '10px', padding: '8px 14px' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                  <img
                    src={data.recommendation.avatar}
                    alt={data.recommendation.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-[13px] truncate">
                      {data.recommendation.name}
                    </p>
                    <span className="text-white/30 text-[11px]">·</span>
                    <p className="text-white/40 text-[11px] shrink-0">
                      {data.recommendation.city}
                    </p>
                  </div>
                  <p className="text-white/55 text-xs italic leading-snug line-clamp-2 mt-0.5">
                    „{data.recommendation.opinion}"
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-[#0b5cff]/10 px-2 py-0.5 rounded-full shrink-0 self-start mt-0.5">
                  <Star className="w-2.5 h-2.5 text-[#0b5cff] fill-[#0b5cff]" />
                  <span className="text-[#0b5cff] text-[10px]">Rekomendacja</span>
                </div>
              </div>
            </div>
        )}

        {/* ── 5. Portfolio thumbnails ── Instagram + TikTok */}
        {((data.recommendation?.instagramPosts && data.recommendation.instagramPosts.length > 0) ||
          (data.recommendation?.tiktokPosts && data.recommendation.tiktokPosts.length > 0)) && (
            <motion.div
              className="pr-5 py-3"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Media</p>

              {/* All media in one row */}
              <div className="flex gap-1.5 overflow-x-auto">
                {[
                  ...(data.recommendation?.instagramPosts ?? []).map((post) => ({ post, kind: 'ig' as const })),
                  ...(data.recommendation?.tiktokPosts ?? []).map((post) => ({ post, kind: 'tt' as const })),
                ].map(({ post, kind }, idx) => (
                  <motion.a
                    key={`${kind}-${post.id}`}
                    href={post.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative w-[68px] h-[68px] rounded-lg overflow-hidden group cursor-pointer flex-shrink-0 ring-1 ring-white/[0.08]"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.22, ease: 'easeOut', delay: 0.08 + idx * 0.04 }}
                  >
                    <img
                      src={post.imageUrl}
                      alt={kind === 'ig' ? 'Realizacja' : 'TikTok'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-0" />
                    <div className="absolute bottom-1 left-1">
                      {kind === 'ig'
                        ? <FaInstagram className="w-3 h-3 text-white/60" />
                        : <FaTiktok className="w-3 h-3 text-white/60" />}
                    </div>
                    {kind === 'tt' && post.type === 'video' && (
                      <div className="absolute top-1 right-1">
                        <svg className="w-3 h-3 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                  </motion.a>
                ))}
              </div>
            </motion.div>
        )}

        {/* ── 8. Follow-up Questions ── */}
        {followUpQuestions && followUpQuestions.length > 0 && onFollowUpClick && (
            <motion.div
              className="pr-5 py-3"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Powiązane pytania</p>
              <div className="space-y-1">
                {followUpQuestions.map((q, idx) => (
                  <motion.button
                    key={q.id}
                    onClick={() => onFollowUpClick(q.text)}
                    className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-200 text-sm"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut', delay: 0.1 + idx * 0.06 }}
                  >
                    {q.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
        )}

        {/* Timestamp */}
        <div className="pr-5 pb-2.5">
          <p className="text-white/20 text-[10px]">
            {new Date(timestamp).toLocaleTimeString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
    </div>
  );
}