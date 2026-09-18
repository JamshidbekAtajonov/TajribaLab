# TajribaLab P0 interfeysi va kimyo demosi

## Maqsad
O‘zbek tilidagi TajribaLab platformasining birinchi ishlaydigan bosqichini yaratish: uch fan katalogi, kimyo bo‘yicha kislota–ishqor titrlash tajribasi, 2D/3D ko‘rinish, qoidaviy AI ustoz, lokal saqlash va hisobot.

## Quriladigan qismlar
1. **Bosh sahifa**
   - TajribaLab nomi va “Har bir o‘quvchiga tajriba qilish imkoniyati” shiori.
   - Kimyo demosini boshlash, katalogni ochish va uch fan bo‘limlariga o‘tish.
   - Fizika va biologiya imkoniyatlari “Tez kunda” deb aniq belgilanadi.

2. **Laboratoriyalar katalogi**
   - Kimyo, fizika va biologiya kartalari.
   - Qidiruv hamda fan, daraja va holat filtrlari.
   - Ishlaydigan titrlash uchun “Batafsil” va “Boshlash”; tugallanmagan tajribalarda faqat “Tez kunda”.

3. **Tajriba haqida sahifa**
   - Maqsad, kerakli bilim, jihozlar, sakkiz bosqich, ideal model shartlari va chegaralari.
   - Yangi sessiya boshlash yoki saqlangan sessiyani davom ettirish.

4. **Interaktiv titrlash laboratoriyasi**
   - Desktopda chapda jihozlar, markazda laboratoriya stoli, o‘ngda AI ustoz va bosqichlar; mobil qurilmada yig‘iladigan pastki panellar.
   - Byuretka, shtativ, Erlenmeyer kolbasi, pipetka, indikator, HCl va NaOH bilan ishlash.
   - Reagent olish/o‘tkazish, indikator qo‘shish, boshlang‘ich ko‘rsatkichni yozish, kranni boshqarish, bitta tomchi, aralashtirish va yakuniy o‘qishni yozish.
   - 2D va 3D ko‘rinishlar bir xil tajriba holatini saqlaydi. 3D ko‘rinish WebGL orqali, 2D ko‘rinish yengil va telefon uchun qulay bo‘ladi.
   - Kuchli bir asosli kislota–ishqor modeli: hajm, modda miqdori, qoldiq ion va pH hisoblari; ekvivalent nuqta yaqinida suv muvozanati; fenolftalein rang holati.
   - Bo‘sh byuretka, yopiq kran, indikator yo‘qligi, noto‘g‘ri joylashuv, yozilmagan boshlang‘ich o‘qish va ortiqcha titrant holatlari tekshiriladi.

5. **AI ustozning P0-A ko‘rinishi**
   - Mazmunli amallarni kuzatadigan, haqiqiy tajriba qiymatlariga bog‘langan o‘zbekcha qoidaviy izohlar.
   - “Nega bunday bo‘ldi?”, “Hozir nima o‘zgardi?”, “Soddaroq tushuntir” va jihozni ko‘rsatish amallari.
   - Bu bosqichda xizmatga ulanmagan generativ AI ishlayotgandek ko‘rsatilmaydi; holat “Avtomatik izoh” deb belgilanadi.

6. **Natija va saqlash**
   - Joriy o‘lchovlar, pH va sarflangan hajm, amallar tarixi, kuzatuv va xulosa.
   - Sessiyani shu qurilmada saqlash, qayta ochish, qayta boshlash, yakuniy hisobot va CSV yuklash.
   - Saqlanmagan holatda chiqishdan oldin ogohlantirish.

## Vizual yo‘nalish
- Yorug‘, ishonchli maktab laboratoriyasi: oq va neytral yuzalar, shisha va metall hissi, kimyo uchun sokin yashil aksent, ogohlantirishlar uchun alohida sariq/qizil rollar.
- Katta markaziy tajriba maydoni, ixcham boshqaruvlar, ravshan o‘lchovlar va kam bezak.
- Barcha faol boshqaruvlar klaviatura, sichqoncha va sensor orqali ishlaydi; sensor maydonlari kamida 44×44 px.

## Texnik yechim
- TanStack Start va React ichida qayta ishlatiladigan katalog, laboratoriya paneli va tajriba holati modullari.
- Three.js/React Three Fiber 3D sahna uchun; alohida SVG/DOM 2D ko‘rinish.
- Ilmiy hisoblash tasvirdan mustaqil bitta holat modelida saqlanadi.
- Lokal saqlash P0 uchun; haqiqiy hisob, sinf boshqaruvi va server AI bu bosqichga kiritilmaydi.

## Tekshirish
- 25 ml bir xil konsentratsiyali HCl va NaOH ekvivalent nuqtaga olib kelishi.
- Yopiq kranda va bo‘sh idishda hajm o‘zgarmasligi; hajm balansi saqlanishi.
- 2D/3D almashganda sessiya, tanlov va natijalar yo‘qolmasligi.
- Qidiruv, filtr, saqlash, davom ettirish, hisobot, CSV va barcha ko‘rinadigan tugmalar ishlashi.
- Desktop va telefon o‘lchamlarida matnlar, panellar va boshqaruvlar ustma-ust tushmasligi.

## P0 dan tashqarida
Haqiqiy hisoblar va sinflar, server orqali generativ AI, fizika/biologiya tajribalari, ovozli yordam hamda F1–F4 kengaytmalari keyingi bosqichlarda qoladi va tayyor funksiyadek ko‘rsatilmaydi.
