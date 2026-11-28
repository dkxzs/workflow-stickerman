---
name: content-strategist
description: Skill Tiền kỳ (Bước 0) săn chủ đề tiếng Anh ít cạnh tranh, kiểm chứng thực tế qua web search theo cổng 4 chốt Pass/Fail có bằng chứng, định hình góc nhìn độc quyền, phong cách kể chuyện chống văn AI và xuất `content-brief.md` cho kênh `Simply Stickman` (`stickman-video`) hoặc `Simply Ink` (`whiteboard-video`). Bắt buộc chạy trước khi sản xuất video mới khi người dùng chưa có kịch bản chốt.
---

# Content Strategist Skill (Bước 0 — Tiền Kỳ & Săn Chủ Đề Độc Quyền)

Skill này chạy ở **Bước 0** (trước `stickman-video` và `whiteboard-video`) nhằm bảo vệ kênh trước chính sách *Inauthentic / Mass-produced / Repetitious Content* của YouTube: chỉ chọn chủ đề **có cầu thật nhưng chưa bị làm nát**, mang **góc nhìn biên tập riêng**, và viết theo **nhân cách kênh rõ ràng, thoát văn mẫu AI**.

> **Quy tắc cô lập:** Skill này chỉ làm nhiệm vụ nghiên cứu, sàng lọc chủ đề và xuất `projects/<project_id>/content-brief.md`. **Tuyệt đối không** sửa code trong `engine/` hay `engines/whiteboard/`.

- **Ngôn ngữ đầu ra nội dung video (cả 2 kênh):** **Tiếng Anh Mỹ tự nhiên (US English)** cho tiêu đề, thumbnail text, dàn ý/kịch bản và giọng đọc TTS.
- **Ngôn ngữ trao đổi với người dùng:** Tiếng Việt (trừ khi người dùng yêu cầu khác).

---

## 1. Chiến lược Ngách Mở & Luật "Chống Hàn Lâm" (Plain-English Curiosity)

Không khóa cứng kênh vào một ngách duy nhất (tránh đụng hàng với hàng nghìn kênh AI khác cùng khai thác một tập chủ đề), đồng thời **tuyệt đối tránh biến video thành bài giảng đại học**:

- **Nguồn ý tưởng ưu tiên (Cụ thể — Dễ hình dung — Gây tò mò ngay):**
  - Những câu hỏi đời thường kỳ quặc ai cũng từng thoáng nghĩ qua (*"Tại sao..."*, *"Chuyện gì xảy ra nếu..."*, *"Bí mật đằng sau..."*).
  - Thiết kế ẩn hoặc "cú lừa" hợp pháp trong đời sống hằng ngày (siêu thị, sân bay, thang máy, thực phẩm, ứng dụng điện thoại, tiền bạc).
  - Sự thật hài hước / kỳ lạ trong lịch sử, cơ thể người, luật lệ hoặc thói quen hằng ngày mà ai nghe cũng hiểu ngay trong 3 giây.
- **Luật "Chống Hàn Lâm" (Bắt buộc):**
  - **Cấm lấy thuật ngữ học thuật/tên hiệu ứng khó nhớ làm tâm điểm** (như *Einstellung Effect*, *Region-Beta Paradox*, *Cognitive Dissonance*...).
  - **Hạn chế chủ đề trừu tượng:** Ưu tiên những thứ *nhìn thấy được, chạm vào được, diễn ra ngoài đời thật* để người que (`Simply Stickman`) có thể diễn hài và bút mực (`Simply Ink`) có thể vẽ vật thể cụ thể.
  - **Bài test "Quán cà phê":** Nếu đọc chủ đề lên mà nghe giống tên chương sách giáo khoa hoặc bài tiểu luận đại học → **LOẠI hoặc đổi sang góc đời thường, bình dân, dễ nghe**.
  - **Nghiên cứu kỹ ở hậu trường — Kể chuyện dễ hiểu trên màn hình:** Vẫn kiểm chứng nguồn thật để không nói sai sự thật, nhưng **không** nhồi tên giáo sư, tên tạp chí khoa học hay lý thuyết dài dòng vào lời thoại.
- **Danh sách chủ đề bão hòa — CẤM ĐỀ XUẤT** (trừ khi có bằng chứng góc lật hoàn toàn mới):
  - Dunning-Kruger cơ bản, Butterfly Effect, Bystander Effect, Prisoner's Dilemma cơ bản, Stoicism 101.
  - Morning Routine / 5 AM Club, Dopamine Detox chung chung, "How to stop procrastinating", "5 habits of successful people", Dark Psychology liệt kê chung chung.

---

## 2. Cổng Kiểm Duyệt 4 Chốt (4-Gate Pass/Fail Có Bằng Chứng)

**Bắt buộc dùng công cụ tìm kiếm web (`search_web` hoặc tương đương) để kiểm chứng thực tế trước khi đề xuất.** Tuyệt đối không tự đoán độ bão hòa hay bịa số liệu/nghiên cứu. Nếu môi trường không có web search, phải báo rõ trạng thái *chưa kiểm chứng web* thay vì giả định PASS.

Mỗi ý tưởng phải vượt qua đủ **4 chốt**:

| Chốt | Câu hỏi kiểm chứng | Điều kiện **PASS** | Điều kiện **FAIL** (Loại ngay) |
|---|---|---|---|
| **1. Demand (Có cầu thật)** | Có bằng chứng thật cho thấy khán giả tiếng Anh quan tâm không? | Có ít nhất 1 tín hiệu thật: thảo luận sôi nổi trên Reddit/báo khoa học/podcast, sách/nghiên cứu gây chú ý, hoặc video học thuật/phỏng vấn dài có lượt xem tốt. | Chủ đề quá hàn lâm hoặc quá lạ nhưng không có nhu cầu tìm kiếm/quan tâm thực tế. |
| **2. Supply Gap (Chưa bão hòa)** | Tìm thật trên YouTube (`site:youtube.com <keyword>`): đã có bao nhiêu kênh lớn làm? | Dưới 3–5 video explainer/hoạt hình từ kênh lớn (>100k sub) trong 2 năm qua; **HOẶC** chỉ có video bài giảng/tin tức dài, khô khan chưa ai chuyển hóa thành hoạt hình trực quan dễ hiểu. | Đã bị các kênh lớn (Kurzgesagt, TED-Ed, Veritasium, The Infographics Show, Psych2Go...) làm nát đúng cùng góc nhìn. |
| **3. Unique Angle (Góc lật độc quyền)** | Mình kể khác kết quả top Google/YouTube chỗ nào? | Chốt được trong **1 câu** góc tiếp cận riêng: lật ngược giả định phổ biến, mô phỏng cơ chế ẩn bên trong, hoặc chỉ ra chi tiết ít ai để ý. | Tóm tắt lại y hệt cấu trúc Wikipedia hoặc bài viết top Google. |
| **4. Visual Fit (Hợp trực quan)** | Hình vẽ có thực sự giúp người xem hiểu sâu hơn audio không? | Có quá trình biến đổi, sơ đồ nhân quả, so sánh trực quan hoặc tình huống hành động rõ ràng cho `Simply Stickman` hoặc `Simply Ink`. | Chỉ là lời khuyên suông hoặc liệt kê trừu tượng, hình vẽ chỉ để trang trí. |

### Luật trình bày cho người dùng (Tối ưu duyệt trong 10 giây)
- **Rớt bất kỳ 1/4 chốt → AI tự loại ngầm**, không đưa vào danh sách đề xuất.
- Chỉ trình bày **3–5 chủ đề đã đạt 4/4 PASS**.
- Mỗi chủ đề trình bày đúng **4 dòng bằng chứng ngắn gọn** (Demand, Supply Gap + nguồn/kết quả search thật, Unique Angle, Visual Fit) để người dùng quyết định ngay mà không phải tự kiểm tra lại.
- **Dừng lại chờ người dùng chọn 1 chủ đề** trước khi viết `content-brief.md`.

---

## 3. Bản Sắc Kênh & Khuôn Kể Chuyện Luân Phiên

Luân phiên giữa **3 khuôn kể chuyện** của mỗi kênh để tránh lặp cấu trúc máy móc (Repetitious Content).

### Kênh 1 — `Simply Stickman` (đẩy sang `stickman-video`)
- **Nhân cách:** Người kể chuyện thông minh, duyên dáng, có **hài hước nhẹ kiểu châm biếm đời thường (dry wit)** — giải thích mọi thứ đơn giản, trực quan, không hàn lâm để nhân vật người que tha hồ diễn tình huống.
- **3 khuôn kể chuyện luân phiên:**
  1. *Timeline Simulation:* Hook nghịch lý (5s đầu) → Mô phỏng theo dòng thời gian/cấp độ → Cơ chế ẩn bên dưới → Twist bất ngờ.
  2. *Myth Autopsy:* Giả định phổ biến → Đẩy nhân vật vào thử nghiệm cho thấy giả định bị gãy → Sự thật vận hành thực tế → Hệ quả bất ngờ.
  3. *Hidden System Breakdown:* Một hiện tượng kỳ lạ ngoài đời thực → Bóc từng mắt xích của hệ thống → Điểm gãy/tác dụng phụ → Câu chốt sắc gọn.
- **Nhịp giọng đọc (Edge TTS — US English):** Linh hoạt, sắc gọn, tốc độ nhanh nhẹ (`+5%`), câu ngắn gãy gọn khớp nhịp đổi góc máy ~3 giây/shot.

### Kênh 2 — `Simply Ink` (đẩy sang `whiteboard-video`)
- **Nhân cách:** Người quan sát sắc sảo ngồi phác thảo sơ đồ tư duy bằng bút mực đen trên nền giấy kem ấm (`#F5EBD7`).
- **3 khuôn kể chuyện luân phiên:**
  1. *Visual Metaphor Map:* Tình huống đời thường ai cũng gặp nhưng chưa gọi tên → 1 hình ẩn dụ vẽ tay xuyên suốt nối các phần → Cơ chế ẩn → 1 câu đúc kết thực tế.
  2. *Paradox Reframe:* Nghịch lý gây khựng lại → Tại sao cách nghĩ thông thường lại phản tác dụng → Vẽ sơ đồ nhân quả thực sự → Cú chốt đổi góc nhìn.
  3. *Forgotten Story → Modern Lens:* Một thí nghiệm/sự kiện nhỏ bị lãng quên → Diễn biến cốt lõi trên giấy → Cách nó đang âm thầm chi phối đời sống hôm nay → Câu kết đọng lại.
- **Nhịp giọng đọc (Edge TTS — US English):** Điềm tĩnh, rõ ràng (`+0%` đến `-3%`), chủ động đặt khoảng nghỉ (`--pause`, ngắt đoạn) trước các câu đắt giá để khớp tốc độ bàn tay vẽ (3,5–6 giây/vùng).

---

## 4. Bộ Quy Tắc "Chống Văn AI" & Tối Ưu Giọng Đọc TTS (US English)

Áp dụng cho cả `content-brief.md` lẫn kịch bản chi tiết ở bước sau:

- **Blacklist cụm từ cấm tuyệt đối:**
  - *"In today's fast-paced world"*, *"Have you ever wondered"*, *"Let's dive in"*, *"Delve into"*, *"Unlock"*, *"Game-changer"*, *"Tapestry"*, *"In conclusion"*, *"It's important to remember"*, *"At the end of the day"*, *"Buckle up"*, *"Picture this"*, *"Welcome back to the channel"*, *"In this video, we're going to..."*.
  - Tránh lạm dụng mẫu câu sáo rỗng *"It's not just X — it's Y"* lặp đi lặp lại trong cùng một kịch bản.
- **Chống cấu trúc văn mẫu AI:**
  - Không kết thúc mỗi đoạn bằng một câu tổng kết đạo lý chung chung.
  - Mỗi phân đoạn chính bắt buộc có **ít nhất 1 điểm neo thực tế đã kiểm chứng** (tên nghiên cứu, năm, con số thật, hoặc phép so sánh vật lý/đời thường cụ thể). **Tuyệt đối không bịa số liệu hoặc nguồn.**
- **Viết cho TAI nghe (Edge TTS):**
  - Xen kẽ câu cực ngắn (3–6 từ để nhấn mạnh) với câu trung bình (12–18 từ).
  - Dùng dấu chấm, dấu phẩy, gạch ngang (`—`) và ngắt đoạn rõ ràng để tạo nhịp thở tự nhiên.
  - Viết thành chữ các ký hiệu/viết tắt (`percent` thay cho `%`, `for example` thay cho `e.g.`) để TTS phát âm chuẩn.

---

## 5. Đầu Ra Chuẩn (`content-brief.md`) & Bàn Giao (Handoff)

Sau khi người dùng chọn 1 chủ đề từ danh sách 4/4 PASS, tạo file `projects/<project_id>/content-brief.md` gồm đầy đủ các mục:

```markdown
# Content Brief — <Working Title>

- **Target Channel:** `Simply Stickman` (`stickman-video`) | `Simply Ink` (`whiteboard-video`)
- **Language:** US English
- **Target Duration:** ~6–8 minutes (hoặc theo yêu cầu)
- **Selected Story Framework:** <1 trong 3 khuôn kể chuyện của kênh>

## 1. 4-Gate Evidence Summary
- **Demand:** <Bằng chứng nhu cầu thật + nguồn>
- **Supply Gap:** <Kết quả kiểm chứng YouTube thật + lỗ hổng đối thủ>
- **Unique Angle:** <1 câu chốt góc nhìn độc quyền>
- **Visual Fit:** <Ẩn dụ / cơ chế hình ảnh chủ đạo>

## 2. Packaging (CTR & Curiosity)
- **Title Options (3 US English variants):**
  1. <Curiosity / Paradox>
  2. <Specific Mechanism / Outcome>
  3. <Contrarian / Myth-busting>
- **Thumbnail Concept:** <Bố cục hình ảnh + tối đa 2–4 từ text tiếng Anh>

## 3. Section-by-Section Outline (Voice & Visual Notes)
- **Hook (0:00–0:20):** <Ý chính + điểm mở gây khựng + nhịp đọc TTS>
- **Section 1–N:** <Luận điểm + Điểm neo thực tế có nguồn + Ghi chú nhịp TTS (pause/nhấn) + Hình ảnh/ẩn dụ chủ đạo>
- **Payoff & Ending:** <Cú chốt/đúc kết 1 câu đắt giá, không giáo điều>

## 4. Verified Sources
1. <Nguồn thật kèm URL>
```

### Quy tắc dừng duyệt & Bàn giao sạch (Không làm trùng việc)
1. Tạo xong `content-brief.md` → **BẮT BUỘC DỪNG** chờ người dùng duyệt.
2. Chỉ sau khi người dùng duyệt `content-brief.md`, mới bàn giao sang luồng dựng video:
   - **Nếu là `Simply Stickman` (`stickman-video`):** Chuyển dữ liệu đã duyệt trong `content-brief.md` vào `projects/<project_id>/01_research.md` (kèm mục `## Approved Concept`) để hoàn tất Gate 1 & Gate 2 mà không phải research lại, rồi đi thẳng sang **Bước 03 (`02_script.md`)**.
   - **Nếu là `Simply Ink` (`whiteboard-video`):** Dùng `content-brief.md` làm đầu vào trực tiếp cho **Bước 0a** (viết `projects/<project_id>/script.md` bằng tiếng Anh US tuân thủ nhịp giọng `Simply Ink` và bộ quy tắc chống văn AI ở mục 4).
