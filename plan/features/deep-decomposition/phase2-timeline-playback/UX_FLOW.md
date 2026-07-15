# 🌊 UX Flow & VCR Debugger Interaction Walkthroughs

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) khi sinh viên gỡ lỗi từng bước thuật toán, kéo miết thanh trượt Scrubber và điều chế tốc độ phát trên **VCR Timeline & Playback Controller**.

---

## 📌 KỊCH BẢN 1: KÉO MIẾT THANH TRƯỢT SCRUBBER CHUYỂN BƯỚC (SCRUBBER SEEKING)

### Tình huống: Học sinh quét nhanh tiến trình gỡ lỗi HeapSort từ bước 2 sang bước 18

```
[Học sinh đang xem hoạt ảnh thuật toán HeapSort ở bước số 2]
[Học sinh bấm chuột vào hạt quét tròn (Knob) trên thanh trượt Scrubber Neon Cyan:]
        |
[Hạt indicator phồng to scale(1.3) rực rỡ Cyan báo hiệu sẵn sàng kéo quét]
[Học sinh miết kéo ngón tay chuột dọc thanh trượt từ trái sang phải:]
  - Tooltip preview di động hiện ra hiển thị số bước thực tế: "Bước 12... Bước 15... Bước 18".
        |
[Hệ thống bốc cache RAM và cập nhật lại Canvas liên tiếp 60 FPS bám sát ngón tay:]
  - Vue store gán lập tức `canvasStateSnapshot = frames[18].canvasStateSnapshot` dưới 5ms.
  - Các cột bar mảng HeapSort hoán vị vị trí bập bùng co giãn nhảy nhót bám sát tay kéo chuột.
        |
[Học sinh thả chuột (MouseUp) tại vị trí bước 18:]
  - Hạt indicator thu nhỏ về kích thước cũ, sáng dịu nhẹ êm ái.
  - Monaco Editor bên cạnh tự động cuộn cuộn mượt mà tô sáng dòng code 15 (dòng hoán vị).
  - SV thích thú reo lên: "Quá đã! Kéo mượt bám tay y như xem video YouTube giải thuật!"
```

---

## 📌 KỊCH BẢN 2: PHÁT TỰ ĐỘNG TỐC ĐỘ 1.5X ĐỒNG BỘ DÒNG LỆNH (AUTOPLAY LOOP)

### Tình huống: Học sinh xem hoạt ảnh tự phát đồng bộ bôi sáng code Monaco Editor

```
[Học sinh bấm phím [ PLAY (PHÁT) ] trên thanh điều hướng VCR kính mờ nhẵn nhụi]
[Học sinh kéo thanh tốc độ phát (Speed Slider) lên mức: 1.5x]
        |
[Hạt nhân VCRPlaybackEngine chuyển đổi đập nhịp xung đồng hồ interval còn: 667ms/bước]
[Cứ mỗi 667ms, tiến trình giải thuật tự động nhảy tiến lên 1 bước:]
  - Hạt indicator trên thanh Scrubber trượt nhẹ nhàng sang phải.
  - Hộp mô tả VCR hiển thị dòng text chạy: "So sánh phần tử mảng[i] với pivot".
        |
[Đồng thời, Monaco Editor cuộn dòng lệnh đồng bộ thời gian thực (Auto-Scroll):]
  - Bôi sáng Cyan viền trái dòng code số 10 đang chạy gỡ lỗi.
  - Dòng lệnh di chuyển nhịp nhàng trôi đi bám sát hoạt ảnh hoán vị bên Canvas.
        |
[Học sinh bấm phím [ PAUSE (TẠM DỪNG) ] -> Hoạt ảnh đứng im tức thì, Monaco giữ nguyên dòng sáng]
```
 Trải nghiệm phím điều hướng VCR mờ kính tinh xảo kết hợp đường trượt Scrubber Neon và đồng bộ nhảy dòng lệnh Monaco mang lại cho sinh viên cảm xúc gỡ lỗi tối cao, thấu hiểu tường tận mọi ngóc ngách của cấu trúc dữ liệu và giải thuật.
