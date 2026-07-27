import { CreateArticleFromIdeaButton } from "./CreateArticleFromIdeaButton";
import { DismissTopicIdeaButton } from "./DismissTopicIdeaButton";

type TopicIdea = {
  id: string;
  title: string;
  brief: string;
  created_at: string;
};

export function ArticleIdeaList({ ideas }: { ideas: TopicIdea[] }) {
  if (ideas.length === 0) {
    return <p className="text-[13px] text-text-3">記事ネタがありません。「記事ネタを生成する」から候補を作成してください。</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {ideas.map((idea) => (
        <div key={idea.id} className="flex flex-wrap items-start justify-between gap-4 border border-line p-4">
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-medium text-text">{idea.title}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-text-2">{idea.brief}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <CreateArticleFromIdeaButton ideaId={idea.id} />
            <DismissTopicIdeaButton ideaId={idea.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
