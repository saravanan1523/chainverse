import { Avatar } from '../ui/Avatar'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import styles from './CommentList.module.css'

interface Comment {
    id: string
    content: string
    createdAt: string
    user: {
        id: string
        name: string
        isPremium: boolean
    }
}

interface CommentListProps {
    comments: Comment[]
}

export function CommentList({ comments }: CommentListProps) {
    if (comments.length === 0) {
        return (
            <div className={styles.empty}>
                No comments yet. Be the first to share your thoughts!
            </div>
        )
    }

    return (
        <div className={styles.list}>
            {comments.map((comment) => (
                <div key={comment.id} className={styles.comment}>
                    <Link href={`/profile/${comment.user.id}`}>
                        <Avatar
                            name={comment.user.name}
                            isPremium={comment.user.isPremium}
                            size="small"
                        />
                    </Link>
                    <div className={styles.commentContent}>
                        <div className={styles.header}>
                            <Link href={`/profile/${comment.user.id}`} className={styles.userName}>
                                {comment.user.name}
                            </Link>
                            <span className={styles.timestamp}>
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        <p className={styles.text}>{comment.content}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
