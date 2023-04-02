import { Ref, prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { CommentModel } from 'src/comment/comment.model'

export interface VideoModel extends Base {}

export class VideoModel extends TimeStamps {
  @prop({ unique: true, required: true })
  name: string

  @prop()
  isPublic: string

  @prop({ default: 0 })
  views?: string

  @prop({ default: 0 })
  like?: number

  @prop({ default: 0 })
  dislike?: number

  @prop()
  description: string

  @prop()
  videoPath: string

  @prop()
  avatarPath: string

  @prop()
  thumbnailPath: string

  @prop({ ref: () => CommentModel })
  comments?: Ref<CommentModel>
}
