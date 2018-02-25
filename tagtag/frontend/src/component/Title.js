import React from 'react'
import { withRouter } from 'react-router'

import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import TitleQuestions from './TitleQuestions'

import { Collapse, Select, Form, Row, Col, Input, Button } from 'antd'
const FormItem = Form.Item
const Option = Select.Option
const Panel = Collapse.Panel;


class Discourse extends React.Component {
  state = {
    discourse: {},
    title: {},
  }

  constructor (props) {
    super(props)
    let { discourse, title } = this.props
    this.setState({ discourse, title})
  }

  componentWillReceiveProps({ discourse, title }) {
    this.setState({ discourse, title })
  }

  handleFieldChange = field => ({target: {value}}) => {
    this.setState(({ discourse }) => ({
      discourse: {...discourse, [field]: value}
    }))
  }

  handleSelectFieldChange = field => value => {
    this.setState(({ discourse }) => ({
      discourse: {...discourse, [field]: value}
    }))
  }

  saveDiscourse = async () => {
    let {data, errors} = await this.props.client.mutate({
      mutation: gql`
        mutation saveDiscourse(
          $academic_rate: Float
          $adjectival_clause_num: Int
          $adverbial_clauses_num: Int
          $avg_syllable_num: Float
          $avg_words_per_sent: Float
          $common_rate: Float
          $compound_sent_adversative_num: Int
          $compound_sent_select_num: Int
          $compound_sent_semantic_exten_num: Int
          $discourse_code: String!
          $family_num: Int
          $id: Int!
          $lemma_num: Int
          $ls_activity_type: String
          $ls_audio_all_time: Float
          $ls_audio_real_time: Float
          $ls_audio_type: String
          $ls_authenticity: String
          $ls_domain: String
          $ls_genre: String
          $ls_speed: Int
          $ls_speed_syllable: Float
          $ls_speed_type: String
          $ls_voice_type: String
          $noun_clauses_num: Int
          $re_domain: String
          $re_familiarity: Int
          $re_flesch_kincaid_grade_level: Float
          $re_genre: String
          $re_is_chart: String
          $sentence_num: Int
          $word_num: Int
        ) {
          change_discourse (
            academic_rate: $academic_rate
            adjectival_clause_num: $adjectival_clause_num
            adverbial_clauses_num: $adverbial_clauses_num
            avg_syllable_num: $avg_syllable_num
            avg_words_per_sent: $avg_words_per_sent
            common_rate: $common_rate
            compound_sent_adversative_num: $compound_sent_adversative_num
            compound_sent_select_num: $compound_sent_select_num
            compound_sent_semantic_exten_num: $compound_sent_semantic_exten_num
            discourse_code: $discourse_code
            family_num: $family_num
            id: $id
            lemma_num: $lemma_num
            ls_activity_type: $ls_activity_type
            ls_audio_all_time: $ls_audio_all_time
            ls_audio_real_time: $ls_audio_real_time
            ls_audio_type: $ls_audio_type
            ls_authenticity: $ls_authenticity
            ls_domain: $ls_domain
            ls_genre: $ls_genre
            ls_speed: $ls_speed
            ls_speed_syllable: $ls_speed_syllable
            ls_speed_type: $ls_speed_type
            ls_voice_type: $ls_voice_type
            noun_clauses_num: $noun_clauses_num
            re_domain: $re_domain
            re_familiarity: $re_familiarity
            re_flesch_kincaid_grade_level: $re_flesch_kincaid_grade_level
            re_genre: $re_genre
            re_is_chart: $re_is_chart
            sentence_num: $sentence_num
            word_num: $word_num
          ) {
            discourse {
              academic_rate
              adjectival_clause_num
              adverbial_clauses_num
              avg_syllable_num
              avg_words_per_sent
              common_rate
              compound_sent_adversative_num
              compound_sent_select_num
              compound_sent_semantic_exten_num
              discourse
              discourse_code
              family_num
              id
              lemma_num
              ls_activity_type
              ls_audio_all_time
              ls_audio_real_time
              ls_audio_type
              ls_authenticity
              ls_domain
              ls_genre
              ls_speed
              ls_speed_syllable
              ls_speed_type
              ls_voice_type
              noun_clauses_num
              re_domain
              re_familiarity
              re_flesch_kincaid_grade_level
              re_genre
              re_is_chart
              sentence_num
              word_num
              discourse_tag_user
              tag_status
              discourse_review_user
              review_status
              review_fail_reason
            }
          }
        }
      `,
      variables: this.state.discourse
    })
    if (errors) {
      alert("保存不成功: " + errors.map(x => x.message))
      console.log('change_discourse ERROR:', errors)
    } else {
      alert("保存成功")
      console.log('change_discourse OK:', data)
      this.setState({ discourse: data.change_discourse.discourse })
      await this._push_discourse()
    }
  }

  _push_discourse = async () => {
    let {data, errors} = await this.props.client.mutate({
      mutation: gql`
        mutation PushDiscourse(
          $discourse_code: String!
        ) {
          push_discourse (
            discourse_code: $discourse_code
          ) {
            discourse {
              academic_rate
              adjectival_clause_num
              adverbial_clauses_num
              avg_syllable_num
              avg_words_per_sent
              common_rate
              compound_sent_adversative_num
              compound_sent_select_num
              compound_sent_semantic_exten_num
              discourse
              discourse_code
              family_num
              id
              lemma_num
              ls_activity_type
              ls_audio_all_time
              ls_audio_real_time
              ls_audio_type
              ls_authenticity
              ls_domain
              ls_genre
              ls_speed
              ls_speed_syllable
              ls_speed_type
              ls_voice_type
              noun_clauses_num
              re_domain
              re_familiarity
              re_flesch_kincaid_grade_level
              re_genre
              re_is_chart
              sentence_num
              word_num
              discourse_tag_user
              tag_status
              discourse_review_user
              review_status
              review_fail_reason
            }
            status
          }
        }
      `,
      variables: this.state.discourse
    })
    if (errors) {
      alert("推送标注不成功: " + errors.map(x => x.message))
      console.log('push_discourse ERROR:', errors)
    } else {
      alert("推送标注成功")
      console.log('push_discourse OK:', data)
      this.setState({ discourse: data.push_discourse.discourse })
    }
  }

  passReview = async () => {
    let {data, errors} = await this.props.client.mutate({
      mutation: gql`
        mutation pass_discourse_review(
          $discourse_code: String!
        ) {
          pass_discourse_review (
            discourse_code: $discourse_code
          ) {
            discourse {
              academic_rate
              adjectival_clause_num
              adverbial_clauses_num
              avg_syllable_num
              avg_words_per_sent
              common_rate
              compound_sent_adversative_num
              compound_sent_select_num
              compound_sent_semantic_exten_num
              discourse
              discourse_code
              family_num
              id
              lemma_num
              ls_activity_type
              ls_audio_all_time
              ls_audio_real_time
              ls_audio_type
              ls_authenticity
              ls_domain
              ls_genre
              ls_speed
              ls_speed_syllable
              ls_speed_type
              ls_voice_type
              noun_clauses_num
              re_domain
              re_familiarity
              re_flesch_kincaid_grade_level
              re_genre
              re_is_chart
              sentence_num
              word_num
              discourse_tag_user
              tag_status
              discourse_review_user
              review_status
              review_fail_reason
            }
            status
          }
        }
      `,
      variables: this.state.discourse
    })
    if (errors) {
      alert("评审操作不成功: " + errors.map(x => x.message))
      console.log('pass_discourse_review ERROR:', errors)
    } else {
      alert("评审操作成功")
      console.log('pass_discourse_review OK:', data)
      this.setState({ discourse: data.pass_discourse_review.discourse })
    }
  }

  notPassReview = async () => {
    let {data, errors} = await this.props.client.mutate({
      mutation: gql`
        mutation not_pass_discourse_review(
          $discourse_code: String!
          $review_fail_reason: String!
        ) {
          not_pass_discourse_review (
            discourse_code: $discourse_code
            review_fail_reason: $review_fail_reason
          ) {
            discourse {
              academic_rate
              adjectival_clause_num
              adverbial_clauses_num
              avg_syllable_num
              avg_words_per_sent
              common_rate
              compound_sent_adversative_num
              compound_sent_select_num
              compound_sent_semantic_exten_num
              discourse
              discourse_code
              family_num
              id
              lemma_num
              ls_activity_type
              ls_audio_all_time
              ls_audio_real_time
              ls_audio_type
              ls_authenticity
              ls_domain
              ls_genre
              ls_speed
              ls_speed_syllable
              ls_speed_type
              ls_voice_type
              noun_clauses_num
              re_domain
              re_familiarity
              re_flesch_kincaid_grade_level
              re_genre
              re_is_chart
              sentence_num
              word_num
              discourse_tag_user
              tag_status
              discourse_review_user
              review_status
              review_fail_reason
            }
            status
          }
        }
      `,
      variables: this.state.discourse
    })
    if (errors) {
      alert("评审操作不成功: " + errors.map(x => x.message))
      console.log('not_pass_discourse_review ERROR:', errors)
    } else {
      alert("评审操作成功")
      console.log('not_pass_discourse_review OK:', data)
      this.setState({ discourse: data.not_pass_discourse_review.discourse })
    }
  }

  render () {

    const formItemLayout = {
      labelCol: {
        xs: { span: 12 },
        sm: { span: 12 },
      },
      wrapperCol: {
        xs: { span: 6 },
        sm: { span: 6 },
      },
    };

    let { discourse, title } = this.state
    console.log('discourse: ', discourse)
    console.log('title: ', title)
    return (
      <Form onSubmit={this.handleSubmit}>
        <Row>
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="文本词数">
              <Input value={discourse.word_num} style={{ width: 120 }} 
                onChange={this.handleFieldChange('word_num')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="平均音节数">
              <Input value={discourse.avg_syllable_num} style={{ width: 120 }} 
                onChange={this.handleFieldChange('avg_syllable_num')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="词元数">
              <Input value={discourse.lemma_num} style={{ width: 120 }} 
                onChange={this.handleFieldChange('lemma_num')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="词族数">
              <Input value={discourse.family_num} style={{ width: 120 }} 
                onChange={this.handleFieldChange('family_num')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="通用词汇占比">
              <Input value={discourse.common_rate} style={{ width: 120 }} 
                onChange={this.handleFieldChange('common_rate')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="学术词汇占比">
              <Input value={discourse.academic_rate} style={{ width: 120 }} 
                onChange={this.handleFieldChange('academic_rate')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
        </Row>

        <hr/>

        { title.title_category === '听力' &&  
        <Row>
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="听力领域">
              <Select value={discourse.ls_domain} style={{ width: 120 }} 
                onChange={this.handleSelectFieldChange('ls_domain')}>
                <Option value="教育">教育</Option>
                <Option value="职场">职场</Option>
                <Option value="公共">公共</Option>
                <Option value="个人">个人</Option>
              </Select>
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="听力文本体裁">
              <Select value={discourse.ls_genre} style={{ width: 120 }} onChange={this.handleSelectFieldChange('ls_genre')}>
                <Option value="议论文">议论文</Option>
                <Option value="说明文">说明文</Option>
                <Option value="记叙文">记叙文</Option>
                <Option value="描述文">描述文</Option>
              </Select>
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="听力活动类型">
              <Select value={discourse.ls_activity_type} style={{ width: 120 }} onChange={this.handleSelectFieldChange('ls_activity_type')}>
                <Option value="独白">独白</Option>
                <Option value="对话">对话</Option>
                <Option value="讨论">讨论</Option>
              </Select>
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="听力素材真实性">
              <Select value={discourse.ls_authenticity} style={{ width: 120 }} onChange={this.handleSelectFieldChange('ls_authenticity')}>
                <Option value="真实语篇">真实语篇</Option>
                <Option value="改编语篇">改编语篇</Option>
              </Select>
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="音频类型">
              <Select value={discourse.ls_audio_type} style={{ width: 120 }} onChange={this.handleSelectFieldChange('ls_audio_type')}>
                <Option value="audio">音频</Option>
                <Option value="video">视频</Option>
              </Select>
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="音频完整时长">
              <Input value={discourse.ls_audio_all_time} style={{ width: 120 }} 
                onChange={this.handleFieldChange('ls_audio_all_time')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="音频真实说话时长">
              <Input value={discourse.ls_audio_real_time} style={{ width: 120 }} 
                onChange={this.handleFieldChange('ls_audio_real_time')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="语速（wpm）">
              <Input value={discourse.ls_speed} style={{ width: 120 }} 
                onChange={this.handleFieldChange('ls_speed')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="语速（wpm）分档">
              <Select value={discourse.ls_speed_type} style={{ width: 120 }} onChange={this.handleSelectFieldChange('ls_speed_type')}>
                <Option value="快速">快速</Option>
                <Option value="较快">较快</Option>
                <Option value="中速">中速</Option>
                <Option value="较慢">较慢</Option>
                <Option value="慢速">慢速</Option>
              </Select>
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="每分钟音节数">
              <Input value={discourse.ls_speed_syllable} style={{ width: 120 }} 
                onChange={this.handleFieldChange('ls_speed_syllable')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="口音">
              <Select value={discourse.ls_voice_type} style={{ width: 120 }} onChange={this.handleSelectFieldChange('ls_voice_type')}>
                <Option value="澳大利亚">澳大利亚</Option>
                <Option value="美音">美音</Option>
                <Option value="英音">英音</Option>
                <Option value="加拿大">加拿大</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        }

        <hr/>

        { title.title_category === '阅读' &&
        <Row>
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="话题熟悉度">
              <Input value={discourse.re_familiarity} style={{ width: 120 }} 
                onChange={this.handleFieldChange('re_familiarity')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
           
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="是否包含图表辅助信息">
              <Select value={discourse.re_is_chart} style={{ width: 120 }}
                onChange={this.handleSelectFieldChange('re_is_chart')}
                disabled={discourse.review_status === '评审通过'}
                >
                <Option value="0">否</Option>
                <Option value="1">是</Option>
              </Select>
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="阅读领域">
              <Select value={discourse.re_domain} style={{ width: 120 }}
                onChange={this.handleSelectFieldChange('re_domain')}
                disabled={discourse.review_status === '评审通过'}
                >
                <Option value="教育">教育</Option>
                <Option value="职场">职场</Option>
                <Option value="公共">公共</Option>
                <Option value="个人">个人</Option>
              </Select>
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="阅读文本体裁">
              <Select value={discourse.re_genre} style={{ width: 120 }}
                onChange={this.handleSelectFieldChange('re_genre')}
                disabled={discourse.review_status === '评审通过'}
                >
                <Option value="议论文">议论文</Option>
                <Option value="说明文">说明文</Option>
                <Option value="记叙文">记叙文</Option>
                <Option value="描述文">描述文</Option>
              </Select>
            </FormItem>
          </Col>
           
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="文本可读性指标">
              <Input value={discourse.re_flesch_kincaid_grade_level} style={{ width: 120 }}
                onChange={this.handleFieldChange('re_flesch_kincaid_grade_level')}
                disabled={discourse.review_status === '评审通过'} />
            </FormItem>
          </Col>
        </Row>
        }

        <hr/>

        <Row>
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="句子数量">
              <Input value={discourse.sentence_num} style={{ width: 120 }} 
                onChange={this.handleFieldChange('sentence_num')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="平均词数">
              <Input value={discourse.avg_words_per_sent} style={{ width: 120 }} 
                onChange={this.handleFieldChange('avg_words_per_sent')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="并列句-语意引申句子数量">
              <Input value={discourse.compound_sent_semantic_exten_num} style={{ width: 120 }} 
                onChange={this.handleFieldChange('compound_sent_semantic_exten_num')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="并列句-转折对比句子数量">
              <Input value={discourse.compound_sent_adversative_num} style={{ width: 120 }} 
                onChange={this.handleFieldChange('compound_sent_adversative_num')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="并列句-选择句子数量">
              <Input value={discourse.compound_sent_select_num} style={{ width: 120 }} 
                onChange={this.handleFieldChange('compound_sent_select_num')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="名词性从句数量">
              <Input value={discourse.noun_clauses_num} style={{ width: 120 }} 
                onChange={this.handleFieldChange('noun_clauses_num')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="形容词性从句数量">
              <Input value={discourse.adjectival_clause_num} style={{ width: 120 }} 
                onChange={this.handleFieldChange('adjectival_clause_num')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="副词性从句数量">
              <Input value={discourse.adverbial_clauses_num} style={{ width: 120 }} 
                onChange={this.handleFieldChange('adverbial_clauses_num')}
                disabled={discourse.review_status === '评审通过'}
              />
            </FormItem>
          </Col>
        </Row>

        <Row>
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="语篇标注人">
              {discourse.discourse_tag_user}
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="语篇标注状态">
              {discourse.tag_status}
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="语篇评审人">
              {discourse.discourse_review_user}
            </FormItem>
          </Col>
          
          <Col span={12} style={{ textAlign: 'right' }}>
            <FormItem {...formItemLayout} label="语篇评审状态">
              {discourse.review_status}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6} style={{ textAlign: 'center' }}>
            <Button onClick={this.saveDiscourse}>保存</Button>
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={this.passReview}>评审通过</Button>
          </Col>
        </Row>
        <Row style={{ marginTop: "15px" }}>
          <Col span={20} style={{ textAlign: 'left' }}>
            <textarea
              style={{width: "96%", height: "100%"}}
              value={discourse.review_fail_reason}
              onChange={this.handleFieldChange('review_fail_reason')}
              >
            </textarea>
          </Col>
          <Col span={3} style={{ textAlign: 'left' }}>
            <Button type="primary" onClick={this.notPassReview}>评审不通过</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}

const TagWrappedDiscoure = Form.create()(withApollo(Discourse))
const WrappedTitleQuestions = withApollo(TitleQuestions)

class Title extends React.Component {
  state = {
    title: {
      discourse: {},
      questions: [],
      title_url: "",
    },
  }
  componentDidMount() {
    let {match: {params: {title_ident}}, client} = this.props
    client.query({
      query: gql`
        query GetTitle ($title_ident: String!) {
          gp_title (title_ident: $title_ident) {
            id
            platform
            title_ident
            title_detail_path
            title_type
            title_course
            title_category
            title_info
            title_url
            video_path
            version
            discourse_code
            block_id
            label_tag_user
            label_tag_status
            label_review_user
            label_review_status
            review_fail_reason
            tutorial_id
            tutorial_name
            unit_id
            unit_name
            minicoz_id
            minicoz_name
            task_id
            discourse {
              id
              discourse_code
              discourse
              ls_domain
              re_domain
              ls_genre
              re_genre
              ls_activity_type
              ls_authenticity
              word_num
              avg_syllable_num
              lemma_num
              family_num
              common_rate
              academic_rate
              ls_audio_type
              ls_audio_all_time
              ls_audio_real_time
              ls_speed
              ls_speed_type
              ls_voice_type
              re_familiarity
              re_is_chart
              sentence_num
              avg_words_per_sent
              re_flesch_kincaid_grade_level
              compound_sent_semantic_exten_num
              compound_sent_adversative_num
              compound_sent_select_num
              noun_clauses_num
              adjectival_clause_num
              adverbial_clauses_num
              discourse_tag_user
              tag_status
              discourse_review_user
              review_status
              review_fail_reason
              ls_speed_syllable
            }
            questions {
              id
              question_index
              title_ident
              content_level_1
              content_level_2
              skill_level_1
              skill_level_2
            }
          }
        }
      `,
      variables: {title_ident}
    }).then(({data: {gp_title}}) => {
      console.log('fetched: current gp_title', gp_title)
      this.setState({ title: gp_title })
    })
  }

  toggleIFrame = () => {
    this.setState(state => ({
      iframeShow: !state.iframeShow
    }))
  }

  render() {
    let { title } = this.state
    let { title: { discourse, questions } } = this.state
    return (
      <Row style={{width: "100%", height: "100%"}}>
        <Col span={this.state.iframeShow ? 12 : 0}>
          <iframe src={title.title_url} style={{width: "100%", height: "100%"}} title="iframe content"/>
        </Col>
        <Col span={this.state.iframeShow ? 12 : 24}>
          <h1 onClick={this.toggleIFrame}>题目详细路径：{ title.title_detail_path }</h1>
          <Collapse accordion defaultActiveKey="1">
            <Panel header="语篇标注" key="1">
              <TagWrappedDiscoure title={title} discourse={discourse}/>
            </Panel>
            <Panel header="微技能标注" key="2">
              <WrappedTitleQuestions title={title} questions={questions}/>
            </Panel>
          </Collapse>
        </Col>
      </Row>
    )
  }
}

export default withApollo(withRouter(Title))
