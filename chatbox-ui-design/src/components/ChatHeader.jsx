import { Icon } from './Icon';

export default function ChatHeader() {
  return (
    <div className="chathead">
      <div className="logo">
        <Icon name="spark" />
      </div>
      <div>
        <h2>NutriLens AI</h2>
        <p>Personalized using verified health profile &amp; meal records</p>
      </div>
      <span className="tag">Personal Nutrition Assistant</span>
    </div>
  );
}
