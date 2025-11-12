<template>
  <div class="register-ib">
    <UiContainer>
      <UiTextH3 class="register-ib_title">
        {{ t('landing.pages.partnership.register_ib_title') }}
      </UiTextH3>

      <PanelDefault class="panel p-5">
        <h4>Коротко</h4>
        <ul>
          <li>Ви отримуєте <strong>персональне посилання</strong> та <strong>QR-код</strong>.</li>
          <li>Кожен, хто зареєструється через них, <strong>автоматично стає вашим рефералом</strong>.</li>
          <li>Система підтримує <strong>до 3 рівнів</strong> вкладеності (ваші прямі, їхні реферали й далі ще один
            рівень).
          </li>
        </ul>
        <p class="note">Мета — прозоро відслідковувати нові реєстрації, щоб ви бачили структуру своєї мережі у
          кабінеті.</p>
      </PanelDefault>

      <PanelDefault class="panel p-5">
        <h4>Як це працює — покроково</h4>
        <ol>
          <li><strong>Отримайте посилання/QR</strong> у розділі «Партнерство / IB» вашого кабінету.</li>
          <li><strong>Поділіться</strong> ним у соцмережах, месенджерах, на сайті або офлайн-матеріалах (QR).</li>
          <li><strong>Користувач переходить</strong> за посиланням або сканує QR і потрапляє на сторінку реєстрації.
          </li>
          <li><strong>PID передається автоматично</strong> (або вводиться вручну, якщо поле доступне).</li>
          <li>Після успішної реєстрації акаунт <strong>прив’язується до вас</strong>.</li>
          <li>Якщо цей користувач ділиться своїм лінком — його реєстрації стають для вас <strong>2-м рівнем</strong>, а
            їхні — <strong>3-м</strong>.
          </li>
        </ol>
      </PanelDefault>

      <PanelDefault class="panel p-5">
        <h4>Схема 3 рівнів</h4>
        <pre class="text-[var(--ui-text-main)]">
Ви (IB)
<span class="text-[var(--color-text-muted)]">├─</span> Рівень 1: Ваші прямі реферали
<span class="text-[var(--color-text-muted)]">│  ├─</span> Рівень 2: реферали ваших рефералів
<span class="text-[var(--color-text-muted)]">│  │  └─</span> Рівень 3: ще один рівень вкладеності
        </pre>
        <ul>
          <li><strong>Рівень 1</strong> — зареєстровані <em>безпосередньо</em> через ваше посилання/QR.</li>
          <li><strong>Рівень 2</strong> — зареєстровані через посилання/QR ваших рефералів 1-го рівня.</li>
          <li><strong>Рівень 3</strong> — зареєстровані через посилання/QR рефералів 2-го рівня.</li>
        </ul>
        <p class="muted">> Більше 3 рівнів зарахування не ведеться.</p>
      </PanelDefault>

      <PanelDefault class="panel p-5">
        <h4>Як відслідковується перехід</h4>
        <ul>
          <li>Реферальне посилання містить ваш <strong>PID</strong>; при переході він зберігається й передається у
            форму.
          </li>
          <li><strong>QR-код</strong> — це той самий лінк у форматі для сканування.</li>
          <li>Поле «Партнерський код» (якщо є) <strong>заповнюється автоматично</strong>, але можна ввести вручну.</li>
        </ul>
        <p class="muted">> Модель атрибуції: <strong>Last-Click</strong> — зараховується останній валідний перехід перед
          реєстрацією.</p>
      </PanelDefault>

      <PanelDefault class="panel p-5">
        <h4>Коли саме зараховується реферал</h4>
        <ul>
          <li>Після натискання «Зареєструватися» і створення акаунта з валідним PID — <strong>акаунт одразу з’являється
            у вашому кабінеті</strong>.
          </li>
          <li>Якщо користувач уже мав акаунт — нове зарахування <strong>не створюється</strong>.</li>
        </ul>
      </PanelDefault>

      <PanelDefault class="panel p-5">
        <h4>Де це видно у кабінеті</h4>
        <ul>
          <li><strong>Партнерський кабінет → Реферали</strong>:
            <ul>
              <li>Список рефералів 1-го рівня (дата, e-mail/ID, статус).</li>
              <li>Таблиця/дерево для 2-го та 3-го рівня.</li>
              <li>Пошук і фільтри: за датою, статусом, країною/лоукейшном (якщо доступно).</li>
            </ul>
          </li>
        </ul>
      </PanelDefault>

      <PanelDefault class="panel p-5">
        <h4>Часті питання</h4>
        <div class="faq">
          <p class="q">Що, якщо користувач перейшов за посиланням, але зареєструвався пізніше?</p>
          <p class="a">Його буде зараховано за Last-Click, якщо на момент реєстрації збережений PID ще валідний.</p>

          <p class="q">Що, якщо був перехід за різними посиланнями?</p>
          <p class="a">Зарахування отримає той IB, за чиїм посиланням був <strong>останній</strong> валідний перехід
            перед реєстрацією.</p>

          <p class="q">Як працює зарахування між різними пристроями?</p>
          <p class="a">Найкраще — перехід і реєстрація в межах одного пристрою/сесії. Якщо пристрій змінено —
            рекомендуємо знову перейти за вашим лінком або сканувати ваш QR перед реєстрацією.</p>

          <p class="q">Чи можна змінити IB для вже зареєстрованого користувача?</p>
          <p class="a">За замовчуванням — ні. Можливо лише через ручну перевірку й погодження з підтримкою (за наявності
            такої політики).</p>
        </div>
      </PanelDefault>

      <PanelDefault class="panel p-5">
        <h4>Правила та обмеження</h4>
        <ul>
          <li>Заборонені спам-розсилки, оманлива реклама та «чорні» практики залучення трафіку.</li>
          <li>Дотримуйтесь правил майданчиків (наприклад, позначення <code>#реклама</code>, якщо це вимагається).</li>
          <li>Заборонено створювати дублікати акаунтів для самозарахування.</li>
          <li>Порушення може призвести до <strong>скасування зарахувань</strong> і <strong>блокування
            партнерства</strong>.
          </li>
        </ul>
      </PanelDefault>

      <PanelDefault class="panel p-5">
        <h4>Умови винагороди (узагальнено)</h4>
        <p class="muted">
          На цій сторінці описано саме механіку зарахування. Детальні умови винагород і тарифів публікуються
          в окремому розділі «Партнерська програма».
        </p>
        <ul>
          <li>Винагороди розраховуються за <strong>актуальними правилами програми</strong>.</li>
          <li>Для кожного рівня може діяти <strong>окремий % або фіксована ставка</strong> (за наявності).</li>
          <li>Виплати здійснюються згідно <strong>графіка</strong>, визначеного в правилах програми.</li>
        </ul>
      </PanelDefault>

      <PanelDefault class="panel p-5">
        <h4>Мікрокопі для UI</h4>
        <ul>
          <li><strong>Кнопки:</strong> «Скопіювати посилання», «Завантажити QR», «Поділитися».</li>
          <li><strong>Підказка до поля коду:</strong> «Поле заповнилося автоматично за вашим посиланням. За потреби —
            можна змінити вручну.»
          </li>
          <li><strong>Банер успіху:</strong> «Готово! Усі, хто зареєструється за цим посиланням або QR, автоматично
            стануть вашими рефералами (до 3 рівнів).»
          </li>
          <li><strong>Попередження:</strong> «Пам’ятайте про правила розміщення партнерських матеріалів. Порушення може
            призвести до скасування зарахувань.»
          </li>
        </ul>
      </PanelDefault>

      <PanelDefault class="panel p-5">
        <h4>Юридичний дисклеймер</h4>
        <p>
          Реферальна система працює відповідно до <strong>Партнерської угоди</strong> та
          <strong>Політики конфіденційності</strong>. Використовуючи посилання/QR, ви погоджуєтесь із цими документами.
          Деталі можуть змінюватися згідно з оновленнями політик.
        </p>
      </PanelDefault>

      <!-- Підсумок -->
      <PanelDefault class="panel p-5">
        <h4>Підсумок</h4>
        <p>
          Поділіться своїм посиланням або QR-кодом — і кожна успішна реєстрація за ними автоматично зарахується до вашої
          мережі з глибиною до 3 рівнів. Усі дані та структура прозоро відображаються у вашому кабінеті.
        </p>
      </PanelDefault>
    </UiContainer>
  </div>
</template>

<script setup lang="ts">
import {definePageMeta} from '~/.nuxt/imports';
import {useI18n} from 'vue-i18n';
import UiContainer from '~/components/ui/UiContainer.vue';
import UiTextH3 from '~/components/ui/UiTextH3.vue';
import PanelDefault from "~/components/block/panels/PanelDefault.vue";


definePageMeta({
  layout: 'main',
  alias: '/register-ib',
});

const {t} = useI18n();
</script>

<style lang="scss" scoped>
.register-ib {
  &_title {
    color: var(--ui-text-main);
    text-align: center;
    margin-bottom: 50px;
  }
}

.panel {
  margin-top: 20px;
}

h4 {
  margin: 0 0 12px;
  color: var(--ui-text-main);
  font-weight: 600;
  font-size: 18px;
}

p, li {
  color: var(--ui-text-secondary);
  line-height: 1.6;
}

ul, ol {
  padding-left: 18px;
  margin: 0 0 8px;
}

.note {
  margin-top: 8px;
  font-style: italic;
}

.muted {
  opacity: 0.9;
}

.ascii {
  background: var(--color-ui-bg, rgba(0, 0, 0, 0.03));
  border: 1px solid var(--color-stroke-ui-dark, rgba(0, 0, 0, 0.08));
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0 12px;
  white-space: pre-wrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12.5px;
}

.faq .q {
  margin: 10px 0 2px;
  font-weight: 600;
  color: var(--ui-text-main);
}

.faq .a {
  margin: 0 0 8px;
}
</style>
