-- Seed data: Genres, Tags, Titles
-- Run in SQL Editor

-- Genres
INSERT INTO genres (name, slug, description) VALUES
('Action', 'action', 'High-energy combat and battles'),
('Adventure', 'adventure', 'Journey and exploration stories'),
('Comedy', 'comedy', 'Humor and lighthearted moments'),
('Drama', 'drama', 'Character-driven emotional stories'),
('Fantasy', 'fantasy', 'Magic, mythical creatures, and other worlds'),
('Romance', 'romance', 'Love and relationship stories'),
('Sci-Fi', 'sci-fi', 'Science fiction and technology'),
('Slice of Life', 'slice-of-life', 'Everyday life stories'),
('Supernatural', 'supernatural', 'Ghosts, demons, and the paranormal'),
('Thriller', 'thriller', 'Suspense and tension'),
('Mystery', 'mystery', 'Puzzles and investigations'),
('Historical', 'historical', 'Set in the past'),
('Martial Arts', 'martial-arts', 'Wuxia and cultivation combat'),
('Cultivation', 'cultivation', 'Xianxia and spiritual cultivation'),
('Harem', 'harem', 'Multiple romantic interests')
ON CONFLICT (slug) DO NOTHING;

-- Tags
INSERT INTO tags (name, slug, category) VALUES
('Strong Protagonist', 'strong-protagonist', 'theme'),
('Reincarnation', 'reincarnation', 'theme'),
('System', 'system', 'theme'),
('Isekai', 'isekai', 'theme'),
('School Life', 'school-life', 'theme'),
('Overpowered MC', 'overpowered-mc', 'theme'),
('Kingdom Building', 'kingdom-building', 'theme'),
('Mature', 'mature', 'demographic'),
('Shounen', 'shounen', 'demographic'),
('Seinen', 'seinen', 'demographic'),
('Donghua Original', 'donghua-original', 'format'),
('Manhua Adaptation', 'manhua-adaptation', 'format'),
('Novel Adaptation', 'novel-adaptation', 'format'),
('Demon Lord', 'demon-lord', 'theme'),
('Psychological', 'psychological', 'theme'),
('Strategy', 'strategy', 'theme')
ON CONFLICT (slug) DO NOTHING;

-- Titles
INSERT INTO titles (slug, title, original_title, native_title, description, type, status, release_year, total_episodes, duration, popularity_score, average_rating, rating_count) VALUES
('soul-land', 'Soul Land', '斗罗大陆', 'Douluo Dalu', 'Tang San inherits the Purple Demon Eye and Blue Silver Grass martial soul, entering the Shrek Academy to cultivate his powers.', 'TV', 'Completed', 2018, 258, 20, 95, 8.5, 1200),
('battle-through-the-heavens', 'Battle Through the Heavens', '斗破苍穹', 'Doupo Cangqiong', 'Young Xiao Yan loses his powers and must regain them to restore his family honor in the continent of Dou Qi.', 'TV', 'Airing', 2017, 320, 20, 92, 8.3, 980),
('a-will-eternal', 'A Will Eternal', '一念永恒', 'Yi Nian Yong Heng', 'Bai Xiaochun discovers the path of immortality and sets off on a journey of cultivation.', 'TV', 'Completed', 2020, 52, 20, 85, 8.0, 650),
('the-outcast', 'The Outcast', '一人之下', 'Yi Ren Zhi Xia', 'Zhang Chulan discovers the hidden world of martial artists and supernatural beings.', 'TV', 'Airing', 2016, 100, 22, 88, 8.7, 1100),
('perfect-world', 'Perfect World', '完美世界', 'Wanmei Shijie', 'Shi Hao embarks on an epic journey through a world of gods, demons, and cultivation.', 'TV', 'Airing', 2021, 200, 20, 90, 8.4, 870),
('swallowed-star', 'Swallowed Star', '吞噬星空', 'Tunshi Xingkong', 'In a world transformed by disasters, Luo Feng aims to become a powerful warrior.', 'TV', 'Airing', 2020, 150, 20, 82, 7.9, 520),
('martial-peak', 'Martial Peak', '武炼巅峰', 'Wu Lian Dian Feng', 'Yang Kai begins his journey from the lowest ranks of martial cultivation to the peak of power.', 'ONA', 'Airing', 2019, 500, 7, 88, 7.8, 750),
('shrouding-the-heavens', 'Shrouding the Heavens', '遮天', 'Zhe Tian', 'Chen Fan falls into a mysterious underground palace and discovers the secrets of immortality.', 'TV', 'Upcoming', 2025, 52, 24, 70, 0, 0),
('renegade-immortal', 'Renegade Immortal', '仙逆', 'Xian Ni', 'Wang Lin, an ordinary boy, enters a cultivation sect and begins his path to immortality.', 'TV', 'Completed', 2016, 52, 25, 80, 8.2, 600),
('Against the Gods', 'Against the Gods', '逆天邪神', 'Ni Tian Xie Shen', 'Yun Che is reborn with the Hereditary Goddess and a powerful divine weapon at his disposal.', 'TV', 'Airing', 2023, 80, 20, 75, 7.5, 400)
ON CONFLICT (slug) DO NOTHING;

-- Link titles to genres
INSERT INTO title_genres (title_id, genre_id)
SELECT t.id, g.id FROM titles t, genres g
WHERE (t.slug = 'soul-land' AND g.slug IN ('action', 'fantasy', 'martial-arts'))
   OR (t.slug = 'battle-through-the-heavens' AND g.slug IN ('action', 'fantasy', 'adventure'))
   OR (t.slug = 'a-will-eternal' AND g.slug IN ('comedy', 'fantasy', 'cultivation'))
   OR (t.slug = 'the-outcast' AND g.slug IN ('action', 'supernatural', 'martial-arts'))
   OR (t.slug = 'perfect-world' AND g.slug IN ('action', 'fantasy', 'cultivation'))
   OR (t.slug = 'swallowed-star' AND g.slug IN ('action', 'sci-fi', 'adventure'))
   OR (t.slug = 'martial-peak' AND g.slug IN ('action', 'fantasy', 'cultivation'))
   OR (t.slug = 'shrouding-the-heavens' AND g.slug IN ('action', 'fantasy', 'mystery'))
   OR (t.slug = 'renegade-immortal' AND g.slug IN ('drama', 'fantasy', 'cultivation'))
   OR (t.slug = 'Against the Gods' AND g.slug IN ('action', 'fantasy', 'adventure'))
ON CONFLICT DO NOTHING;

-- Link titles to tags
INSERT INTO title_tags (title_id, tag_id)
SELECT t.id, tg.id FROM titles t, tags tg
WHERE (t.slug = 'soul-land' AND tg.slug IN ('strong-protagonist', 'cultivation'))
   OR (t.slug = 'battle-through-the-heavens' AND tg.slug IN ('strong-protagonist', 'overpowered-mc'))
   OR (t.slug = 'a-will-eternal' AND tg.slug IN ('cultivation'))
   OR (t.slug = 'the-outcast' AND tg.slug IN ('donghua-original'))
   OR (t.slug = 'perfect-world' AND tg.slug IN ('strong-protagonist', 'overpowered-mc'))
   OR (t.slug = 'swallowed-star' AND tg.slug IN ('sci-fi'))
   OR (t.slug = 'martial-peak' AND tg.slug IN ('strong-protagonist', 'manhua-adaptation'))
   OR (t.slug = 'shrouding-the-heavens' AND tg.slug IN ('novel-adaptation'))
   OR (t.slug = 'renegade-immortal' AND tg.slug IN ('novel-adaptation', 'cultivation'))
   OR (t.slug = 'Against the Gods' AND tg.slug IN ('strong-protagonist', 'overpowered-mc', 'harem'))
ON CONFLICT DO NOTHING;

-- Add a season for each title
INSERT INTO seasons (title_id, season_number, name)
SELECT id, 1, 'Season 1' FROM titles
ON CONFLICT (title_id, season_number) DO NOTHING;

SELECT 'Seed data complete!' as status;